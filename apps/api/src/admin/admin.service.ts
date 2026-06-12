import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, vendors, products, orders, pendingVendors, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.vendor.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] } },
      }),
    ])
    return {
      users,
      vendors,
      products,
      orders,
      pendingVendors,
      revenue: Number(revenue._sum.total ?? 0),
    }
  }

  listVendors(status?: string) {
    return this.prisma.vendor.findMany({
      where: status ? { status: status as any } : undefined,
      include: { user: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async setVendorStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } })
    if (!vendor) throw new NotFoundException('البائع غير موجود')
    const updated = await this.prisma.vendor.update({ where: { id }, data: { status } })
    if (status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: vendor.userId },
        data: { role: 'VENDOR' },
      })
    }
    return updated
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, fullName: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
  }

  async listOrders() {
    const orders = await this.prisma.order.findMany({
      include: { user: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    // توحيد الاسم ليطابق الواجهة (customer)
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt,
      customer: o.user,
    }))
  }
}
