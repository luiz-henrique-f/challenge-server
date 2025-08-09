import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // O TypeOrmModule é um módulo de importação, então ele deve ir aqui.
    TypeOrmModule.forFeature([Order]),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'orders',
            brokers: ['kafka:29092'],
          },
        },
      },
    ]),
  ],
  controllers: [
    OrdersController, // Apenas os controladores ficam nesta seção.
  ],
  providers: [OrdersService],
})
export class OrdersModule {}
