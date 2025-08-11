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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/searchByItems')
  searchByItems(@Body() searchParams: GetSearchByItemsDto) {
    return this.ordersService.searchByItems(searchParams);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Get('/searchId/:id')
  searchById(@Param('id') id: string) {
    return this.ordersService.searchById(id);
  }

  @Get('/searchStatus/:status')
  searchByStatus(@Param('status') status: string) {
    return this.ordersService.searchByStatus(status);
  }

  @Get('/searchDateRange/:startDate/:endDate')
  searchByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ) {
    return this.ordersService.searchByDateRange(startDate, endDate);
  }
}
