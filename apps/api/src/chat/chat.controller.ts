import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('conversations')
  start(@CurrentUser('userId') userId: string, @Body('vendorId') vendorId: string) {
    return this.chat.getOrCreate(userId, vendorId)
  }

  @Get('conversations')
  list(
    @CurrentUser('userId') userId: string,
    @CurrentUser('vendorId') vendorId: string | null,
  ) {
    return this.chat.listConversations(userId, vendorId)
  }

  @Get('conversations/:id/messages')
  messages(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('vendorId') vendorId: string | null,
  ) {
    return this.chat.getMessages(id, userId, vendorId)
  }

  @Post('conversations/:id/messages')
  send(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body('body') body: string,
  ) {
    return this.chat.sendMessage(id, userId, body)
  }

  @Post('conversations/:id/read')
  read(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.chat.markRead(id, userId)
  }
}
