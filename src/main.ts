import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Cria o servidor HTTP (aplicação principal)
  const app = await NestFactory.create(AppModule);

  // Conecta o microsserviço Kafka ao servidor principal
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'], // Use o endereço do seu broker Kafka
      },
      /* consumer: {
        groupId: 'orders-consumer', // Defina um groupId para o consumidor
      }, */
    },
  });

  // Inicia o microsserviço e o servidor HTTP
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();