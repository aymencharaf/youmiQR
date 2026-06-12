import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { PaymentMethod } from '@youmi/db'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiate(@Body() body: { orderId: string; method: PaymentMethod }) {
    return this.payments.initiate(body.orderId, body.method)
  }

  // تستدعيها بوابة SATIM بعد الدفع (redirect)
  @Get('satim/callback')
  async satimCallback(@Query('orderId') mdOrder: string, @Res() res: Response) {
    const result = await this.payments.satimCallback(mdOrder)
    const web = process.env.PUBLIC_WEB_URL || 'http://localhost:3000'
    return res.redirect(`${web}/checkout/result?paid=${result.paid ? '1' : '0'}`)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('confirm-manual')
  confirmManual(@Body() body: { orderId: string; reference: string }) {
    return this.payments.confirmManual(body.orderId, body.reference)
  }
}
