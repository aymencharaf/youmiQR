import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { nameAr: 'asc' },
    })
  }

  create(data: { nameAr: string; nameFr?: string; slug: string; parentId?: string }) {
    return this.prisma.category.create({ data })
  }
}
