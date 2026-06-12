import { Controller, Get, Query } from '@nestjs/common'
import { InstallmentsService } from './installments.service'

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installments: InstallmentsService) {}

  /** GET /installments/plans?amount=45000 */
  @Get('plans')
  plans(@Query('amount') amount: string) {
    return this.installments.plansFor(Number(amount))
  }
}
