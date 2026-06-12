import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import { ShippingService } from './shipping.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('shipping')
export class ShippingController {
  constructor(private shipping: ShippingService) {}

  @Get('wilayas')
  wilayas() {
    return this.shipping.listWilayas()
  }

  @Get('wilayas/:id/communes')
  communes(@Param('id', ParseIntPipe) id: number) {
    return this.shipping.communes(id)
  }

  @Get('rates')
  rates(@Query('wilayaId', ParseIntPipe) wilayaId: number) {
    return this.shipping.rates(wilayaId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'VENDOR')
  @Post('parcels')
  createParcel(@Body() body: { orderId: string; courier: 'YALIDINE' | 'ZR_EXPRESS' }) {
    return this.shipping.createParcel(body.orderId, body.courier)
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id/track')
  track(@Param('id') id: string) {
    return this.shipping.track(id)
  }
}
