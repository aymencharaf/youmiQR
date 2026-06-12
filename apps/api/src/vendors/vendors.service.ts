import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserRole, VendorStatus } from '@youmi/db'

function slugify(input: string) {
  return (
    input.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6)
  )
}

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async apply(
    userId: string,
    data: {
      storeName: string
      description?: string
      idCardUrl?: string
      saleType?: 'RETAIL' | 'WHOLESALE' | 'BOTH'
    },
  ) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } })
    if (existing) throw new BadRequestException('لديك متجر بالفعل')
    const vendor = await this.prisma.vendor.create({
      data: {
        userId,
        storeName: data.storeName,
        slug: slugify(data.storeName),
        description: data.description,
        idCardUrl: data.idCardUrl,
        saleType: data.saleType ?? 'BOTH',
        status: VendorStatus.PENDING,
      },
    })
    return vendor
  }

  async publicStore(slug: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { slug },
      include: { products: { where: { status: 'PUBLISHED' }, include: { images: true } } },
    })
    if (!vendor || vendor.status !== VendorStatus.APPROVED)
      throw new NotFoundException('المتجر غير متاح')
    return vendor
  }

  async dashboard(vendorId: string) {
    const [productCount, orderItemCount, items, vendor] = await Promise.all([
      this.prisma.product.count({ where: { vendorId } }),
      this.prisma.orderItem.count({ where: { vendorId } }),
      this.prisma.orderItem.findMany({
        where: { vendorId },
        select: { unitPrice: true, quantity: true, commission: true, orderId: true },
      }),
      this.prisma.vendor.findUnique({ where: { id: vendorId }, select: { commissionRate: true } }),
    ])
    const revenue = items.reduce((sum, it) => sum + Number(it.unitPrice) * it.quantity, 0)
    const commission = items.reduce((sum, it) => sum + Number(it.commission), 0)
    const orderCount = new Set(items.map((it) => it.orderId)).size
    return {
      productCount,
      orderCount,
      soldItems: orderItemCount,
      revenue,
      commission,
      commissionRate: Number(vendor?.commissionRate ?? 0),
    }
  }

  listProducts(vendorId: string) {
    return this.prisma.product.findMany({
      where: { vendorId },
      include: { images: true, category: { select: { nameAr: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listOrders(vendorId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        order: {
          include: { user: { select: { fullName: true, phone: true } } },
        },
      },
      take: 200,
    })
    // تجميع عناصر الطلب حسب الطلب (حصة البائع فقط)
    const map = new Map<string, any>()
    for (const it of items) {
      const o = it.order
      if (!o) continue
      if (!map.has(o.id)) {
        map.set(o.id, {
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          createdAt: o.createdAt,
          total: 0,
          customer: o.user,
        })
      }
      map.get(o.id).total += Number(it.unitPrice) * it.quantity
    }
    return Array.from(map.values()).sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    )
  }
}
