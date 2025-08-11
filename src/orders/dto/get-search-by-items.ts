import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetSearchByItemsDto {
  @IsOptional()
  @IsString()
  productId?: string;
  
  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  preco?: number;
}
