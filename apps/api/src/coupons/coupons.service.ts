import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CouponType } from '@youmi/db'

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  /** التحقق من صلاحية كوبون وحساب قيمة الخصم. */
  async validate(code: string, subtotal: number, vendorId?: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } })
    if (!coupon || !coupon.isActive) throw new NotFoundException('الكوبون غير صالح')

    const now = new Date()
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('الكوبون لم يبدأ بعد')
    if (coupon.expiresAt && coupon.expiresAt < now) throw new BadRequestException('انتهت صلاحية الكوبون')
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('تم استنفاد الكوبون')
    }
    if (coupon.vendorId && coupon.vendorId !== vendorId) {
      throw new BadRequestException('الكوبون غير صالح لهذا البائع')
    }
    if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
      throw new BadRequestException(`الحد الأدنى للطلب ${Number(coupon.minOrder)} د.ج`)
    }

    let discount =
      coupon.type === CouponType.PERCENTAGE
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value)
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount))
    discount = Math.min(discount, subtotal)

    return { couponId: coupon.id, code: coupon.code, discount: Math.round(discount) }
  }

  /** تسجيل استخدام الكوبون (يُستدعى عند تأكيد الطلب). */
  async redeem(couponId: string) {
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    })
  }

  // —— إدارة الكوبونات (للإدارة/البائع) ——
  create(data: any) {
    return this.prisma.coupon.create({ data })
  }

  list(vendorId?: string) {
    return this.prisma.coupon.findMany({
      where: vendorId ? { vendorId } : {},
      orderBy: { createdAt: 'desc' },
    })
  }

  async setActive(id: string, isActive: boolean) {
    return this.prisma.coupon.update({ where: { id }, data: { isActive } })
  }
}
