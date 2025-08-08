import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
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
