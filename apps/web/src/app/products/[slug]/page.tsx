import { api } from '@/lib/api'
import { Price } from '@/components/Price'
import { AddToCartButton } from '@/components/AddToCartButton'
import type { CartLine } from '@/store/cart'
import { notFound } from 'next/navigation'

async function getProduct(slug: string) {
  try {
    return await api<any>(`/products/${slug}`)
  } catch {
    return null
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) return notFound()
  const img = product.images?.[0]?.url || 'https://placehold.co/600x600?text=Youmi'

  const cartLine: CartLine = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    image: img,
    vendorName: product.vendor?.storeName || '',
    quantity: 1,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl overflow-hidden border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={product.name} className="w-full object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-500 mb-4">البائع: {product.vendor?.storeName}</p>
        <div className="mb-4">
          <Price value={product.price} compareAt={product.compareAtPrice} size="lg" />
        </div>
        <p className="text-gray-700 leading-7 mb-6 whitespace-pre-line">{product.description}</p>
        <AddToCartButton line={cartLine} />
        <div className="mt-6 text-sm text-gray-600 space-y-1">
          <p>✅ الدفع عند الاستلام متاح</p>
          <p>🚚 توصيل لجميع الولايات 58</p>
        </div>
      </div>
    </div>
  )
}
