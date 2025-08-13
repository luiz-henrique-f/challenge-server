import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/api/types';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDERS_SERVICE')
    private kafkaClient: ClientKafka,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrder = this.orderRepository.create(createOrderDto);
      const order = await queryRunner.manager.save(newOrder);

      await queryRunner.commitTransaction();

      this.handlePostOrderCreation(order);

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Falha ao criar pedido: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Não foi possível criar o pedido devido a uma falha interna.',
      );
    } finally {
      try {
        await queryRunner.release();
      } catch (releaseError) {
        this.logger.warn(
          `Erro ao liberar query runner: ${releaseError.message}`,
        );
      }
    }
  }

  private async handlePostOrderCreation(order: Order) {
    try {
      this.logger.log(
        `Tentando enviar evento 'order_created' para o Kafka para o pedido ${order.id}`,
      );
      await lastValueFrom(this.kafkaClient.emit('order_created', order));
      this.logger.log(
        `Evento 'order_created' enviado com sucesso para o Kafka`,
      );
    } catch (kafkaError) {
      this.logger.error(
        `Falha ao publicar evento no Kafka para o pedido ${order.id}: ${kafkaError.message}`,
        kafkaError.stack,
      );
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'orders',
        id: order.id,
        body: { order },
      });
      this.logger.log(
        `Pedido ${order.id} indexado no Elasticsearch:`,
        result.body,
      );
    } catch (esError) {
      this.logger.error(
        `Falha ao indexar pedido no Elasticsearch para o pedido ${order.id}: ${esError.message}`,
        esError.stack,
      );
    }
  }

  findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: string): Promise<Order | null> {
    return await this.orderRepository.findOne({ where: { id } });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.orderRepository.findOne({ where: { id } });

    if (!existingOrder) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado.`);
    }

    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatedOrder = Object.assign(existingOrder, updateOrderDto);
      await queryRunner.manager.save(updatedOrder);

      await this.sendKafkaEvent(updatedOrder);
      await this.updateElasticsearch(id, updatedOrder);

      await queryRunner.commitTransaction();

      return updatedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Falha ao atualizar pedido ${id}: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Não foi possível atualizar o pedido devido a uma falha interna.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async sendKafkaEvent(updatedOrder: Order): Promise<void> {
    this.logger.log(
      `Tentando enviar evento 'order_status_updated' para o Kafka para o pedido ${updatedOrder.id}`,
    );
    await lastValueFrom(
      this.kafkaClient.emit('order_status_updated', updatedOrder),
    );
    this.logger.log(
      `Evento 'order_status_updated' enviado com sucesso para o Kafka`,
    );
  }

  private async updateElasticsearch(
    id: string,
    updatedOrder: Order,
  ): Promise<void> {
    await this.elasticsearchService.update({
      index: 'orders',
      id,
      body: {
        doc: {
          order: {
            ...updatedOrder,
            status: updatedOrder.status,
          },
        },
        doc_as_upsert: true,
      },
    });
    this.logger.log(`Pedido ${id} atualizado no Elasticsearch.`);
  }

  async remove(id: string) {
    const orderToRemove = await this.orderRepository.findOne({ where: { id } });

    if (!orderToRemove) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    await this.orderRepository.remove(orderToRemove);

    return { message: `Pedido com ID ${id} removido com sucesso.` };
  }

  async searchById(id: string) {
    const { body } = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          term: {
            'order.id.keyword': id, // keyword para busca exata
          },
        },
      },
    });
    return body.hits.hits;
  }

  // 2. Buscar por status do pedido
  async searchByStatus(status: string) {
    const { body } = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            'order.status': status,
          },
        },
      },
    });
    return body.hits.hits;
  }

  // 3. Buscar por intervalo de datas (campo createdAt)
  async searchByDateRange(startDate: string, endDate: string) {
    const { body } = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          range: {
            'order.createdAt': {
              gte: startDate, // exemplo: "2025-08-01T00:00:00Z"
              lte: endDate, // exemplo: "2025-08-10T23:59:59Z"
            },
          },
        },
      },
    });
    return body.hits.hits;
  }

  // 4. Buscar por itens contidos no pedido (campo items.nome)
  async searchByItems(searchParams: {
    productId?: string;
    quantidade?: number;
    preco?: number;
  }) {
    const mustClauses: QueryDslQueryContainer[] = [];

    if (searchParams.productId) {
      mustClauses.push({
        match: {
          'order.items.productId': searchParams.productId,
        },
      });
    }

    if (searchParams.quantidade) {
      mustClauses.push({
        term: {
          'order.items.quantidade': searchParams.quantidade,
        },
      });
    }

    if (searchParams.preco) {
      mustClauses.push({
        term: {
          'order.items.preco': searchParams.preco,
        },
      });
    }

    const { body } = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          bool: {
            must: mustClauses,
          },
        },
      },
    });

    return body.hits.hits;
  }
}
