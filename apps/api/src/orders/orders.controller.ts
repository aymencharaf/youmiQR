import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/order.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(userId, dto)
  }

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.orders.list(userId)
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.orders.findOne(userId, id)
  }
}
