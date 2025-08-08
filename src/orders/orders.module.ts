import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    // O TypeOrmModule é um módulo de importação, então ele deve ir aqui.
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [
    OrdersController // Apenas os controladores ficam nesta seção.
  ],
  providers: [OrdersService],
})
export class OrdersModule {}