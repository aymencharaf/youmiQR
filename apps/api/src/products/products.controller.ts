import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto, ListProductsQuery } from './dto/product.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@youmi/db'

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.products.list(query)
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.products.findOne(slug)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @Post()
  create(@CurrentUser('vendorId') vendorId: string, @Body() dto: CreateProductDto) {
    return this.products.create(vendorId, dto)
  }
}
