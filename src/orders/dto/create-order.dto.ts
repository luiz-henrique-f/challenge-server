// src/orders/dto/create-order.dto.ts

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger'; // Importe o decorator
import { OrderStatus } from '../entities/order.entity';

// DTO para a estrutura de um item individual do pedido
class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '60c72b2f9b1d8e001c8a4d4a',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  preco: number;
}

// DTO principal para a criação do pedido
export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemDto], // Importante para documentar o array de objetos
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Status do pedido',
    enum: OrderStatus, // Usa o enum para mostrar as opções disponíveis
    example: OrderStatus.PENDENTE,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}