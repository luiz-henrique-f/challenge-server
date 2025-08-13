// src/orders/dto/update-order.dto.ts

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
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from './create-order.dto';

// DTO para a estrutura de um item individual do pedido
class UpdateOrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '60c72b2f9b1d8e001c8a4d4a',
    required: false, // Indica que o campo é opcional
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
    required: false, // Indica que o campo é opcional
  })
  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 99.99,
    required: false, // Indica que o campo é opcional
  })
  @IsOptional()
  @IsNumber()
  preco?: number;
}

// DTO principal para a atualização do pedido
export class UpdateOrderDto {
  @ApiProperty({
    description: 'Lista de itens do pedido a serem atualizados',
    type: [UpdateOrderItemDto], // Documenta o array de objetos
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({
    description: 'Novo status do pedido',
    enum: OrderStatus, // Mostra as opções válidas
    example: OrderStatus.ENVIADO,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}