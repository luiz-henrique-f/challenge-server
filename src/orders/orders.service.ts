import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDERS_SERVICE')
    private kafkaClient: ClientKafka,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    const order = await this.orderRepository.save(newOrder);
    await lastValueFrom(this.kafkaClient.emit('order_created', order));
    const result = await this.elasticsearchService.index({
      index: 'orders',
      id: order.id,
      body: {
        order,
      },
    });
    console.log('Elasticsearch index result:', result);

    return order;
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

    const updatedOrder = Object.assign(existingOrder, updateOrderDto);

    await this.orderRepository.save(updatedOrder);

    // Envia atualização para o Kafka
    await lastValueFrom(
      this.kafkaClient.emit('order_status_updated', updatedOrder),
    );

    // Atualiza no Elasticsearch usando o mesmo ID do banco como _id
    await this.elasticsearchService.update({
      index: 'orders',
      id,
      body: {
        doc: {
          order: {
            ...existingOrder,
            status: updateOrderDto.status,
          },
        },
        doc_as_upsert: true,
      },
    });

    return updatedOrder;
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
    nome?: string;
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

    if (searchParams.nome) {
      mustClauses.push({
        match: {
          'order.items.nome': searchParams.nome,
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
