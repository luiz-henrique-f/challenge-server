import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: ['kafka:9092'],
  //     },
  //     consumer: {
  //       groupId: 'orders-consumer',
  //     },
  //   },
  // });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
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
  });
  
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
