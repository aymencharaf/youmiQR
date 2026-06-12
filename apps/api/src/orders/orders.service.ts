import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto } from './dto/order.dto'
import { OrderStatus, PaymentStatus, Prisma } from '@youmi/db'

function genOrderNumber() {
  return 'YM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    })
    if (!address) throw new NotFoundException('عنوان التوصيل غير موجود')

    // load products / variants
    const productIds = dto.items.map((i) => i.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    })

    let subtotal = new Prisma.Decimal(0)
    const itemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) throw new BadRequestException('أحد المنتجات غير متوفر')
      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null
      const unitPrice = variant ? variant.price : product.price
      const stock = variant ? variant.stock : product.stock
      if (stock < item.quantity) throw new BadRequestException(`الكمية غير متوفرة للمنتج: ${product.name}`)
      const commission = new Prisma.Decimal(unitPrice).mul(item.quantity).mul(0.1) // default 10%
      subtotal = subtotal.add(new Prisma.Decimal(unitPrice).mul(item.quantity))
      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        vendorId: product.vendorId,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        commission,
      }
    })

    // shipping fee from per-wilaya rate
    const rate = await this.prisma.shippingRate.findFirst({
      where: { wilayaId: address.wilayaId, vendorId: null },
    })
    const shippingFee = rate
      ? dto.shippingType === 'STOPDESK'
        ? rate.stopdeskPrice
        : rate.homePrice
      : new Prisma.Decimal(500)

    // coupon
    let discount = new Prisma.Decimal(0)
    let couponId: string | null = null
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } })
      if (coupon && coupon.isActive) {
        couponId = coupon.id
        if (coupon.type === 'PERCENTAGE') {
          discount = subtotal.mul(Number(coupon.value)).div(100)
          if (coupon.maxDiscount && discount.gt(coupon.maxDiscount)) discount = coupon.maxDiscount
        } else {
          discount = new Prisma.Decimal(coupon.value)
        }
      }
    }

    const total = subtotal.add(shippingFee).sub(discount)

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: genOrderNumber(),
          userId,
          addressId: address.id,
          status: OrderStatus.PENDING,
          subtotal,
          shippingFee,
          discount,
          total,
          shippingType: dto.shippingType,
          courier: dto.courier,
          couponId,
          notes: dto.notes,
          items: { create: itemsData },
          payment: {
            create: {
              method: dto.paymentMethod,
              status: PaymentStatus.PENDING,
              amount: total,
            },
          },
          statusHistory: { create: { status: OrderStatus.PENDING, note: 'تم إنشاء الطلب' } },
        },
        include: { items: true, payment: true },
      })

      // decrement stock
      for (const item of dto.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          })
        }
      }
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
      }
      return created
    })

    return order
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true, address: { include: { wilaya: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        payment: true,
        address: { include: { wilaya: true, commune: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!order) throw new NotFoundException('الطلب غير موجود')
    return order
  }
}
