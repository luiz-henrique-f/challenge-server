import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    // ClientsModule.register([
    //   {
    //     name: 'ORDERS_SERVICE',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         clientId: 'orders',
    //         brokers: ['kafka:9092'],
    //       },
    //     },
    //   },
    // ]),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'orders',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
            sasl: process.env.KAFKA_USERNAME
              ? {
                  mechanism: 'plain',
                  username: process.env.KAFKA_USERNAME,
                  password: process.env.KAFKA_PASSWORD || '',
                }
              : undefined,
            ssl: process.env.KAFKA_USERNAME ? true : undefined,
          },
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID || 'orders-consumer',
          },
        },
      },
    ]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch01:9200',
      auth:  process.env.ELASTICSEARCH_API_KEY
        ? {
        apiKey: process.env.ELASTICSEARCH_API_KEY || '',
      }
        : undefined,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
