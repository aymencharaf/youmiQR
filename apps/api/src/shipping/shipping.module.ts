import { Module } from '@nestjs/common'
import { ShippingController } from './shipping.controller'
import { ShippingService } from './shipping.service'
import { YalidineAdapter } from './adapters/yalidine.adapter'
import { ZrExpressAdapter } from './adapters/zrexpress.adapter'

@Module({
  controllers: [ShippingController],
  providers: [ShippingService, YalidineAdapter, ZrExpressAdapter],
  exports: [ShippingService],
})
export class ShippingModule {}
