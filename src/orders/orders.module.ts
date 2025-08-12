import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

// Crie o objeto de configuração do Elasticsearch de forma dinâmica.
const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch01:9200',
};

// Se a chave da API for fornecida, adicione-a à configuração.
if (process.env.ELASTICSEARCH_API_KEY) {
  elasticsearchConfig['auth'] = {
    apikey: process.env.ELASTICSEARCH_API_KEY,
  };
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
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
    ElasticsearchModule.register(elasticsearchConfig),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
