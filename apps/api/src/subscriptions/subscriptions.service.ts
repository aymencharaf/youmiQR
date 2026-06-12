import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export type PlanInput = {
  name: string
  description?: string
  price: number
  durationDays?: number
  productLimit?: number | null
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /** الخطط المتاحة للعرض العام. */
  listActive() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
  }

  /** المتاجر المشتركة (معتمدة ولديها خطة) — للسلايدر في الصفحة الرئيسية. */
  subscribedStores() {
    return this.prisma.vendor.findMany({
      where: { status: 'APPROVED', planId: { not: null } },
      select: { id: true, storeName: true, slug: true, logoUrl: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
  }

  /** كل الخطط (لوحة المدير). */
  listAll() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { vendors: true } } },
    })
  }

  create(data: PlanInput) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays ?? 30,
        productLimit: data.productLimit ?? null,
        features: data.features ?? [],
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    })
  }

  async update(id: string, data: Partial<PlanInput>) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('الخطة غير موجودة')
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        durationDays: data.durationDays,
        productLimit: data.productLimit,
        features: data.features,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    })
  }

  async remove(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!plan) throw new NotFoundException('الخطة غير موجودة')
    await this.prisma.vendor.updateMany({ where: { planId: id }, data: { planId: null } })
    await this.prisma.subscriptionPlan.delete({ where: { id } })
    return { ok: true }
  }

  /** اشتراك بائع في خطة. */
  async assignVendor(vendorId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) throw new NotFoundException('الخطة غير موجودة')
    const start = new Date()
    const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { planId, subscriptionStart: start, subscriptionEnd: end },
    })
  }
}
