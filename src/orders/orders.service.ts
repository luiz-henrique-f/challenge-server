import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject('ORDERS_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    await lastValueFrom(this.kafkaClient.emit('order_created', newOrder));
    return this.orderRepository.save(newOrder);
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

    await lastValueFrom(this.kafkaClient.emit('order_status_updated', updatedOrder));

    return this.orderRepository.save(updatedOrder);
  }

  async remove(id: string) {
    const orderToRemove = await this.orderRepository.findOne({ where: { id } });

    if (!orderToRemove) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
    }

    await this.orderRepository.remove(orderToRemove);

    return { message: `Pedido com ID ${id} removido com sucesso.` };
  }
}
