import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CouponsService } from './coupons.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(@Body() body: { code: string; subtotal: number; vendorId?: string }) {
    return this.coupons.validate(body.code, body.subtotal, body.vendorId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'VENDOR')
  @Post()
  create(@Body() body: any) {
    return this.coupons.create(body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'VENDOR')
  @Get()
  list(@Query('vendorId') vendorId?: string) {
    return this.coupons.list(vendorId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'VENDOR')
  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.coupons.setActive(id, isActive)
  }
}
