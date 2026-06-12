import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.notifications.list(userId)
  }

  @Get('unread-count')
  unread(@CurrentUser('userId') userId: string) {
    return this.notifications.unreadCount(userId)
  }

  @Patch(':id/read')
  markRead(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id)
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('userId') userId: string) {
    return this.notifications.markAllRead(userId)
  }
}
