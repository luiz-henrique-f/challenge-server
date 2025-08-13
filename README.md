# Starsoft Backend Challenge - API de Pedidos

## 📋 Descrição

API REST desenvolvida em NestJS para gerenciamento de pedidos com integração a múltiplas tecnologias: PostgreSQL, Elasticsearch, Kafka e TypeORM. A aplicação oferece operações CRUD completas para pedidos, busca otimizada através do Elasticsearch e comunicação assíncrona via eventos Kafka.

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js (versão 18 ou superior)
- npm ou yarn

### Configuração e Execução

1. **Clone o repositório**

   ```bash
   git clone https://github.com/luiz-henrique-f/challenge-server.git
   cd challenge-server
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Execute a aplicação com Docker**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

A aplicação estará disponível em `http://localhost:3000`

## 🛠️ Tecnologias Utilizadas

- **Backend**: NestJS (Node.js)
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Busca**: Elasticsearch 7.9.2
- **Mensageria**: Apache Kafka
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker & Docker Compose

## 📊 Funcionalidades Implementadas

### 🔧 Operações CRUD de Pedidos

- **CREATE**: Criação de novos pedidos
- **READ**: Busca de pedidos por ID, listagem de todos os pedidos
- **UPDATE**: Atualização de pedidos (principalmente status)
- **DELETE**: Exclusão de pedidos

### 🔍 Sistema de Busca Avançada

A aplicação utiliza o **Elasticsearch** para otimizar as buscas por:

- **Identificador do pedido**: Busca rápida por ID
- **Status do pedido**: Filtro por status específico
- **Intervalo de datas**: Busca por período de criação
- **Itens contidos no pedido**: Busca por itens específicos

### 📡 Integração com Kafka

A aplicação publica eventos no Kafka para:

- **`order_created`**: Evento disparado na criação de novos pedidos
- **`order_status_updated`**: Evento disparado na atualização do status do pedido

### 🗄️ Sincronização com Elasticsearch

- Dados são automaticamente indexados no Elasticsearch na criação de pedidos
- Atualizações de status são refletidas no Elasticsearch em tempo real
- Buscas otimizadas através do Elasticsearch para melhor performance

## 🌐 Endpoints da API

### Pedidos

- `GET /orders` - Lista todos os pedidos
- `GET /orders/:id` - Busca pedido por ID
- `POST /orders` - Cria novo pedido
- `PATCH /orders/:id` - Atualiza pedido
- `DELETE /orders/:id` - Remove pedido

### Busca Avançada

- `GET /orders/searchId/:id` - Busca por ID específico
- `GET /orders/searchStatus/:status` - Busca por status
- `GET /orders/searchDateRange/:startDate/:endDate` - Busca por intervalo de datas
- `POST /orders/searchByItems` - Busca por itens contidos no pedido

## 🔧 Serviços Docker

A aplicação utiliza os seguintes containers:

- **App**: API NestJS (porta 3000)
- **PostgreSQL**: Banco de dados (porta 5432)
- **Elasticsearch**: Motor de busca (porta 9200)
- **Kafka**: Broker de mensagens (porta 9092)
- **Kafka UI**: Interface gráfica para monitoramento do Kafka (porta 8080)
- **Kibana**: Interface gráfica para monitoramento do Elasticsearch (porta 5601)

### Acessos às Interfaces

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Kafka UI**: http://localhost:8080
- **Kibana**: http://localhost:5601

## 📈 Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   NestJS    │    │ PostgreSQL  │    │ Elasticsearch│
│   API       │◄──►│   Database  │    │   Search    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Kafka    │    │  Kafka UI   │    │   Kibana    │
│   Events    │    │  Monitor    │    │   Monitor   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🧪 Testes

**Status**: Em desenvolvimento

Os testes ainda não foram implementados, mas estão nos planos de desenvolvimento. O projeto já possui a estrutura de testes configurada com Jest.

## 🚧 Limitações e Melhorias Futuras

### ⚠️ Limitações Atuais

1. **Testes**: A aplicação não possui testes automatizados implementados
2. **Monitoramento**: Falta integração com Grafana para métricas avançadas
3. **Autenticação**: Não há sistema de autenticação/autorização
4. **Validação**: Validações básicas implementadas, mas podem ser expandidas
5. **Logs**: Sistema de logs estruturados não implementado

### 🔮 Melhorias Planejadas

1. **Testes Automatizados**
   - Implementar testes unitários com Jest
   - Adicionar testes de integração
   - Configurar testes end-to-end

2. **Monitoramento e Observabilidade**
   - Integração com Grafana para dashboards
   - Implementação de métricas customizadas
   - Sistema de alertas

3. **Segurança**
   - Implementar autenticação JWT
   - Adicionar autorização baseada em roles
   - Rate limiting para endpoints

4. **Performance**
   - Implementar cache com Redis
   - Otimizar queries do Elasticsearch
   - Adicionar paginação nas listagens

5. **DevOps**
   - CI/CD pipeline
   - Deploy automatizado
   - Health checks mais robustos

## 📝 Licença

Este projeto foi desenvolvido como parte do desafio técnico da Starsoft.

## 👨‍💻 Desenvolvedor

Desenvolvido com foco em boas práticas, arquitetura escalável e integração com tecnologias modernas de desenvolvimento.
