import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { SatimAdapter } from './adapters/satim.adapter'

@Module({
  providers: [PaymentsService, SatimAdapter],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
