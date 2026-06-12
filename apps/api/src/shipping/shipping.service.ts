import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { YalidineAdapter, type ParcelInput } from './adapters/yalidine.adapter'
import { ZrExpressAdapter } from './adapters/zrexpress.adapter'

@Injectable()
export class ShippingService {
  constructor(
    private prisma: PrismaService,
    private yalidine: YalidineAdapter,
    private zrexpress: ZrExpressAdapter,
  ) {}

  listWilayas() {
    return this.prisma.wilaya.findMany({ orderBy: { id: 'asc' } })
  }

  communes(wilayaId: number) {
    return this.prisma.commune.findMany({ where: { wilayaId }, orderBy: { nameAr: 'asc' } })
  }

  async rates(wilayaId: number) {
    return this.prisma.shippingRate.findFirst({
      where: { wilayaId, vendorId: null },
      include: { wilaya: true },
    })
  }

  /** إنشاء طرد شحن لطلب عبر الناقل المختار. */
  async createParcel(orderId: string, courier: 'YALIDINE' | 'ZR_EXPRESS') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: { include: { wilaya: true, commune: true } },
        items: true,
      },
    })
    if (!order) throw new NotFoundException('الطلب غير موجود')
    if (!order.address) throw new BadRequestException('لا يوجد عنوان للطلب')

    const input: ParcelInput = {
      orderNumber: order.orderNumber,
      customerName: order.address.fullName,
      customerPhone: order.address.phone,
      wilayaName: order.address.wilaya.nameAr,
      communeName: order.address.commune?.nameAr || order.address.wilaya.nameAr,
      address: order.address.street || order.address.wilaya.nameAr,
      productList: order.items.map((i) => i.productName).join(', ').slice(0, 250),
      amountDzd: Number(order.total),
      isStopdesk: order.shippingType === 'STOPDESK',
    }

    const result =
      courier === 'YALIDINE'
        ? await this.yalidine.createParcel(input)
        : await this.zrexpress.createParcel(input, order.address.wilayaId)

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        courier,
        trackingNumber: result.trackingNumber,
        status: 'SHIPPED',
      },
    })
    return result
  }

  /** تتبّع طرد حسب الناقل. */
  async track(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } })
    if (!order?.trackingNumber) throw new NotFoundException('لا يوجد رقم تتبع')
    if (order.courier === 'ZR_EXPRESS') return this.zrexpress.track(order.trackingNumber)
    return this.yalidine.track(order.trackingNumber)
  }
}
