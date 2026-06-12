import { Global, Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { SmsAdapter } from './adapters/sms.adapter'
import { EmailAdapter } from './adapters/email.adapter'

@Global()
@Module({
  providers: [NotificationsService, SmsAdapter, EmailAdapter],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
