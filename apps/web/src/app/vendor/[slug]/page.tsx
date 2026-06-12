import { api, type Product } from '@/lib/api'
import { ProductCard } from '@/components/ProductCard'
import { notFound } from 'next/navigation'

type Store = {
  id: string
  storeName: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  bannerUrl?: string | null
  rating?: string | number
  ratingCount?: number
  products: Product[]
}

async function getStore(slug: string): Promise<Store | null> {
  try {
    return await api<Store>('/vendors/' + slug)
  } catch {
    return null
  }
}

export default async function VendorStorePage({
  params,
}: {
  params: { slug: string }
}) {
  const store = await getStore(params.slug)
  if (!store) notFound()

  const products = store.products || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* غلاف المتجر */}
      <div className="rounded-2xl overflow-hidden border bg-white mb-6">
        <div className="h-40 md:h-56 bg-gradient-to-l from-brand to-brand-dark relative">
          {store.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.bannerUrl} alt={store.storeName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="h-20 w-20 -mt-12 rounded-2xl border-4 border-white bg-gray-50 shadow flex items-center justify-center overflow-hidden">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-extrabold text-brand">{store.storeName.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{store.storeName}</h1>
            {store.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{store.description}</p>
            )}
            {!!store.ratingCount && (
              <p className="text-sm text-amber-500 mt-1">
                ★ {Number(store.rating || 0).toFixed(1)}{' '}
                <span className="text-gray-400">({store.ratingCount})</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* منتجات المتجر */}
      <h2 className="text-xl font-bold mb-4">منتجات المتجر</h2>
      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">
          لا توجد منتجات منشورة بعد.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
