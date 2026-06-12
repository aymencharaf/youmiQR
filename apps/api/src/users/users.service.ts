import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: { include: { wilaya: true } }, wallet: true },
    })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    const { passwordHash, ...rest } = user as any
    return rest
  }

  addAddress(userId: string, data: any) {
    return this.prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        wilayaId: data.wilayaId,
        communeId: data.communeId ?? null,
        street: data.street ?? null,
        isDefault: !!data.isDefault,
      },
    })
  }
}
