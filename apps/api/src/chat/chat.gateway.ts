import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'

/**
 * بوابة الدردشة اللحظية عبر Socket.IO.
 * العميل ينضم لغرفة المحادثة ثم يرسل/يستقبل الرسائل.
 */
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server

  constructor(private chat: ChatService) {}

  handleConnection(client: Socket) {
    // يمكن التحقق من الرمز (JWT) هنا عبر client.handshake.auth.token
    client.emit('connected', { id: client.id })
  }

  @SubscribeMessage('join')
  onJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.join(`conv:${data.conversationId}`)
    return { joined: data.conversationId }
  }

  @SubscribeMessage('message')
  async onMessage(
    @MessageBody() data: { conversationId: string; senderId: string; body: string },
  ) {
    const message = await this.chat.sendMessage(data.conversationId, data.senderId, data.body)
    this.server.to(`conv:${data.conversationId}`).emit('message', message)
    return message
  }
}
