import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Pedidos')
    .setDescription(`
      Esta é uma API robusta e escalável para o gerenciamento completo de pedidos.
      A aplicação permite a realização de todas as operações CRUD (Criar, Ler,
      Atualizar e Deletar) em pedidos, armazenando os dados em um banco de dados
      PostgreSQL.

      **Principais Funcionalidades:**

      * **CRUD de Pedidos**: Gerencie o ciclo de vida de cada pedido, desde
          a criação até a remoção.
      * **Busca Avançada com Elasticsearch**: Para garantir pesquisas rápidas e
          flexíveis, a API utiliza o Elasticsearch para buscas avançadas,
          incluindo:
          -   Busca por identificador do pedido.
          -   Busca por status do pedido.
          -   Busca por intervalo de datas.
          -   Busca por itens contidos no pedido.

      Esta documentação interativa permite que você explore e teste todos os endpoints
      disponíveis, compreendendo a estrutura de requisições e respostas.
    `)
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

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
