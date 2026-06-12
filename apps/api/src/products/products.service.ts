import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto, ListProductsQuery } from './dto/product.dto'
import { ProductStatus } from '@youmi/db'

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListProductsQuery) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(50, Number(query.limit) || 20)
    const where: any = { status: ProductStatus.PUBLISHED }
    if (query.q) where.name = { contains: query.q, mode: 'insensitive' }
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.vendorId) where.vendorId = query.vendorId

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: true, vendor: { select: { id: true, storeName: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ])
    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        variants: true,
        category: true,
        vendor: { select: { id: true, storeName: true, slug: true, rating: true } },
        reviews: { include: { user: { select: { fullName: true } } }, take: 20 },
      },
    })
    if (!product) throw new NotFoundException('المنتج غير موجود')
    return product
  }

  async create(vendorId: string | null | undefined, dto: CreateProductDto) {
    if (!vendorId) throw new ForbiddenException('هذا الإجراء متاح للبائعين فقط')
    return this.prisma.product.create({
      data: {
        vendorId,
        name: dto.name,
        slug: slugify(dto.name),
        description: dto.description,
        categoryId: dto.categoryId,
        type: dto.type,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        sku: dto.sku,
        barcode: dto.barcode,
        stock: dto.stock,
        status: ProductStatus.PENDING,
        images: dto.images?.length
          ? { create: dto.images.map((url, i) => ({ url, position: i })) }
          : undefined,
        variants: dto.variants?.length
          ? {
              create: dto.variants.map((v) => ({
                name: v.name,
                attributes: v.attributes,
                price: v.price,
                sku: v.sku,
                barcode: v.barcode,
                stock: v.stock,
              })),
            }
          : undefined,
      },
      include: { images: true, variants: true },
    })
  }
}
