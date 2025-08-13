// src/orders/dto/get-search-by-items.dto.ts

import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSearchByItemsDto {
  @ApiProperty({
    description: 'ID do produto para buscar',
    example: '60c72b2f9b1d8e001c8a4d4a',
    required: false, // Indica que o campo é opcional na documentação
  })
  @IsOptional()
  @IsString()
  productId?: string;
  
  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @ApiProperty({
    description: 'Preço do produto',
    example: 99.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  preco?: number;
}