import Link from 'next/link'
import { Price } from '@/components/Price'
import type { Product } from '@/lib/api'

export function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]?.url || 'https://placehold.co/400x400?text=Youmi'
  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2 h-10">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{product.vendor?.storeName}</p>
        <div className="mt-2 flex items-center gap-2">
          <Price value={product.price} compareAt={product.compareAtPrice} />
        </div>
      </div>
    </Link>
  )
}
