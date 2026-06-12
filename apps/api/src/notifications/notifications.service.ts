import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SmsAdapter } from './adapters/sms.adapter'
import { EmailAdapter } from './adapters/email.adapter'

type NotifyInput = {
  userId: string
  title: string
  body: string
  type?: string
  data?: any
  channels?: Array<'db' | 'sms' | 'email'>
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsAdapter,
    private email: EmailAdapter,
  ) {}

  /** إرسال إشعار عبر عدة قنوات. الافتراضي: تخزين في القاعدة فقط. */
  async notify(input: NotifyInput) {
    const channels = input.channels ?? ['db']
    const record = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type ?? 'general',
        data: input.data ?? undefined,
      },
    })

    if (channels.includes('sms') || channels.includes('email')) {
      const user = await this.prisma.user.findUnique({
        where: { id: input.userId },
        select: { phone: true, email: true },
      })
      if (user) {
        if (channels.includes('sms') && user.phone) {
          await this.sms.send(user.phone, `${input.title}\n${input.body}`)
        }
        if (channels.includes('email') && user.email) {
          await this.email.send(user.email, input.title, `<p>${input.body}</p>`)
        }
      }
    }
    return record
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    })
    return { ok: true }
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
    return { ok: true }
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, readAt: null } })
    return { count }
  }
}
