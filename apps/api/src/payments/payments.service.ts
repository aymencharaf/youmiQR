import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SatimAdapter } from './adapters/satim.adapter'
import { PaymentMethod, PaymentStatus } from '@youmi/db'

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private satim: SatimAdapter,
  ) {}

  /** بدء عملية دفع لطلب موجود. */
  async initiate(orderId: string, method: PaymentMethod) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException('الطلب غير موجود')

    const amount = Number(order.total)
    const payment = await this.prisma.payment.upsert({
      where: { orderId },
      create: { orderId, method, amount, status: PaymentStatus.PENDING },
      update: { method, amount, status: PaymentStatus.PENDING },
    })

    switch (method) {
      case PaymentMethod.COD:
        return { method, status: 'PENDING', message: 'الدفع عند الاستلام — لا حاجة للدفع الآن.' }
      case PaymentMethod.CIB:
      case PaymentMethod.EDAHABIA: {
        const base = process.env.PUBLIC_API_URL || 'http://localhost:4000/api'
        const reg = await this.satim.registerOrder({
          orderNumber: order.orderNumber,
          amountDzd: amount,
          returnUrl: `${base}/payments/satim/callback`,
        })
        await this.prisma.payment.update({
          where: { orderId },
          data: { transactionRef: reg.mdOrder, providerData: { mdOrder: reg.mdOrder } },
        })
        return { method, redirectUrl: reg.formUrl, transactionRef: reg.mdOrder }
      }
      case PaymentMethod.CCP:
      case PaymentMethod.BARIDIMOB:
        return {
          method,
          status: 'PENDING',
          instructions: {
            ccpAccount: process.env.CCP_ACCOUNT || '00799999000000000099',
            ccpKey: process.env.CCP_KEY || '99',
            ccpName: process.env.CCP_NAME || 'YOUMI SARL',
            amount,
            note: `ارسل إثبات التحويل مع رقم الطلب ${order.orderNumber}`,
          },
        }
      case PaymentMethod.WALLET:
        return this.payWithWallet(order.userId, orderId, amount)
      default:
        throw new BadRequestException('طريقة دفع غير مدعومة')
    }
  }

  /** الدفع من رصيد المحفظة. */
  async payWithWallet(userId: string, orderId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } })
      if (!wallet || Number(wallet.balance) < amount) {
        throw new BadRequestException('رصيد المحفظة غير كافٍ')
      }
      await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      })
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, type: 'DEBIT', amount, description: `دفع الطلب ${orderId}` },
      })
      await tx.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      })
      await tx.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } })
      return { method: 'WALLET', status: 'PAID' }
    })
  }

  /** استدعاء SATIM بعد الدفع (من صفحة البوابة). */
  async satimCallback(mdOrder: string) {
    const payment = await this.prisma.payment.findFirst({ where: { transactionRef: mdOrder } })
    if (!payment) throw new NotFoundException('عملية الدفع غير موجودة')
    const result = await this.satim.confirmOrder(mdOrder)
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.paid ? PaymentStatus.PAID : PaymentStatus.FAILED,
        paidAt: result.paid ? new Date() : null,
        providerData: result.raw,
      },
    })
    if (result.paid) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      })
    }
    return { paid: result.paid }
  }

  /** تأكيد دفع CCP/BaridiMob يدوياً من الإدارة. */
  async confirmManual(orderId: string, reference: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } })
    if (!payment) throw new NotFoundException('عملية الدفع غير موجودة')
    await this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.PAID, paidAt: new Date(), transactionRef: reference },
    })
    await this.prisma.order.update({ where: { id: orderId }, data: { status: 'CONFIRMED' } })
    return { status: 'PAID' }
  }
}
