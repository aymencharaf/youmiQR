import { api, type Product } from '@/lib/api'
import { ProductCard } from '@/components/ProductCard'

async function getProducts(searchParams: Record<string, string>): Promise<Product[]> {
  const params = new URLSearchParams()
  if (searchParams.q) params.set('q', searchParams.q)
  if (searchParams.categoryId) params.set('categoryId', searchParams.categoryId)
  params.set('limit', '24')
  try {
    const data = await api<{ items: Product[] }>(`/products?${params.toString()}`)
    return data.items
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const products = await getProducts(searchParams)
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">
        {searchParams.q ? `نتائج البحث: ${searchParams.q}` : 'جميع المنتجات'}
      </h1>
      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">لا توجد نتائج.</div>
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
