import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /** إيجاد أو إنشاء محادثة بين زبون وبائع. */
  async getOrCreate(customerId: string, vendorId: string) {
    return this.prisma.conversation.upsert({
      where: { customerId_vendorId: { customerId, vendorId } },
      create: { customerId, vendorId },
      update: {},
    })
  }

  /** قائمة محادثات المستخدم (كزبون أو كبائع). */
  async listConversations(userId: string, vendorId?: string | null) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ customerId: userId }, ...(vendorId ? [{ vendorId }] : [])] },
      include: {
        vendor: { select: { storeName: true, slug: true } },
        customer: { select: { fullName: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getMessages(conversationId: string, userId: string, vendorId?: string | null) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('المحادثة غير موجودة')
    if (conv.customerId !== userId && conv.vendorId !== vendorId) {
      throw new ForbiddenException('غير مصرّح')
    }
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
  }

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('المحادثة غير موجودة')
    const message = await this.prisma.chatMessage.create({
      data: { conversationId, senderId, body },
    })
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
    return message
  }

  async markRead(conversationId: string, userId: string) {
    await this.prisma.chatMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    })
    return { ok: true }
  }
}
