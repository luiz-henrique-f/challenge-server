import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetSearchByItemsDto } from './dto/get-search-by-items';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/searchByItems')
  @ApiOperation({
    summary: 'Busca pedidos por itens (Body)',
    description: 'Retorna uma lista de pedidos que contêm os itens especificados no corpo da requisição.',
  })
  @ApiBody({
    type: GetSearchByItemsDto,
    description: 'Parâmetros de busca por itens',
  })
  @ApiOkResponse({ description: 'Pedidos encontrados.' })
  @ApiBadRequestResponse({ description: 'Dados de busca inválidos.' })
  searchByItems(@Body() searchParams: GetSearchByItemsDto) {
    return this.ordersService.searchByItems(searchParams);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria um novo pedido',
    description: 'Cria um novo pedido com os itens e status fornecidos.',
  })
  @ApiCreatedResponse({ description: 'Pedido criado com sucesso.', type: CreateOrderDto })
  @ApiBadRequestResponse({ description: 'Dados de criação inválidos.' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os pedidos',
    description: 'Retorna uma lista de todos os pedidos existentes.',
  })
  @ApiOkResponse({ description: 'Lista de pedidos retornada com sucesso.' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um pedido por ID',
    description: 'Retorna um único pedido pelo seu ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: '60c72b2f9b1d8e001c8a4d4a' })
  @ApiOkResponse({ description: 'Pedido encontrado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um pedido por ID',
    description: 'Atualiza parcialmente um pedido com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: '60c72b2f9b1d8e001c8a4d4a' })
  @ApiBody({ type: UpdateOrderDto, description: 'Dados para atualização do pedido.' })
  @ApiOkResponse({ description: 'Pedido atualizado com sucesso.', type: UpdateOrderDto })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui um pedido por ID',
    description: 'Exclui um pedido permanentemente com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido a ser excluído', example: '60c72b2f9b1d8e001c8a4d4a' })
  @ApiOkResponse({ description: 'Pedido excluído com sucesso.' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado.' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Get('/searchId/:id')
  @ApiOperation({
    summary: 'Busca pedido pelo ID',
    description: 'Busca um pedido pelo seu ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiOkResponse({ description: 'Pedido encontrado com sucesso.' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado.' })
  searchById(@Param('id') id: string) {
    return this.ordersService.searchById(id);
  }

  @Get('/searchStatus/:status')
  @ApiOperation({
    summary: 'Busca pedidos por status',
    description: 'Busca uma lista de pedidos com um determinado status.',
  })
  @ApiParam({ name: 'status', description: 'Status do pedido', example: 'SHIPPED' })
  @ApiOkResponse({ description: 'Lista de pedidos encontrada.' })
  @ApiNotFoundResponse({ description: 'Nenhum pedido encontrado com este status.' })
  searchByStatus(@Param('status') status: string) {
    return this.ordersService.searchByStatus(status);
  }

  @Get('/searchDateRange/:startDate/:endDate')
  @ApiOperation({
    summary: 'Busca pedidos por intervalo de datas',
    description: 'Busca pedidos criados em um intervalo de datas específico.',
  })
  @ApiParam({ name: 'startDate', description: 'Data de início (ISO 8601)', example: '2025-01-01' })
  @ApiParam({ name: 'endDate', description: 'Data de fim (ISO 8601)', example: '2025-12-31' })
  @ApiOkResponse({ description: 'Pedidos encontrados no intervalo de datas.' })
  @ApiBadRequestResponse({ description: 'Formato de data inválido.' })
  searchByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ) {
    return this.ordersService.searchByDateRange(startDate, endDate);
  }
}