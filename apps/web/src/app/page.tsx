import Link from 'next/link'
import { api, type Product } from '@/lib/api'
import { ProductCard } from '@/components/ProductCard'
import { StoreLogosMarquee } from '@/components/StoreLogosMarquee'
import { formatDZD } from '@/lib/format'

type Plan = {
  id: string
  name: string
  description?: string | null
  price: string | number
  durationDays: number
  productLimit: number | null
  features: string[]
}

async function getProducts(): Promise<Product[]> {
  try {
    const data = await api<{ items: Product[] }>('/products?limit=12')
    return data.items
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    return await api<any[]>('/categories')
  } catch {
    return []
  }
}

async function getPlans(): Promise<Plan[]> {
  try {
    return await api<Plan[]>('/subscriptions/plans')
  } catch {
    return []
  }
}

type Store = { id: string; storeName: string; slug: string; logoUrl?: string | null }

async function getStores(): Promise<Store[]> {
  try {
    return await api<Store[]>('/subscriptions/stores')
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categories, plans, stores] = await Promise.all([
    getProducts(),
    getCategories(),
    getPlans(),
    getStores(),
  ])
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-l from-brand to-brand-dark text-white p-8 md:p-12 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          تسوّق من كل الجزائر في مكان واحد
        </h1>
        <p className="text-white/90 mb-6 max-w-xl">
          آلاف المنتجات من بائعين موثوقين، دفع عند الاستلام، وتوصيل لـ 58 ولاية.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/products" className="bg-accent text-gray-900 px-6 py-3 rounded-lg font-bold">
            تصفّح المنتجات
          </Link>
          <a
            href="/download"
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-lg font-bold backdrop-blur-sm transition"
          >
            <span aria-hidden>📱</span>
            حمّل التطبيق
          </a>
        </div>
      </section>

      {/* Subscribed stores marquee */}
      <StoreLogosMarquee stores={stores} />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">الفئات</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?categoryId=${c.id}`}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm hover:border-brand"
              >
                {c.nameAr}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Subscription plans */}
      {plans.length > 0 && (
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">خطط البيع على Youmi</h2>
            <p className="text-gray-500 text-sm mt-1">
              اشترك بخطة تناسبك وابدأ البيع — دون عمولة على مبيعاتك.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, idx) => {
              const featured = idx === 1
              return (
                <div
                  key={plan.id}
                  className={
                    'rounded-2xl border p-6 flex flex-col ' +
                    (featured
                      ? 'border-brand bg-brand text-white shadow-lg scale-[1.02]'
                      : 'border-gray-200 bg-white')
                  }
                >
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.description && (
                    <p className={'text-sm mt-1 ' + (featured ? 'text-white/80' : 'text-gray-500')}>
                      {plan.description}
                    </p>
                  )}
                  <div className="mt-4 mb-1">
                    <span className="text-3xl font-extrabold">{formatDZD(plan.price)}</span>
                    <span className={'text-sm ' + (featured ? 'text-white/80' : 'text-gray-400')}>
                      {' '}/ {plan.durationDays} يوم
                    </span>
                  </div>
                  <ul className={'space-y-2 mt-4 text-sm flex-1 ' + (featured ? 'text-white/90' : 'text-gray-600')}>
                    <li>✓ عدد المنتجات: {plan.productLimit == null ? 'غير محدود' : plan.productLimit}</li>
                    {(plan.features || []).map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                  <Link
                    href="/vendor/register"
                    className={
                      'mt-6 text-center px-4 py-2.5 rounded-lg font-bold transition ' +
                      (featured
                        ? 'bg-white text-brand hover:bg-white/90'
                        : 'bg-brand text-white hover:opacity-90')
                    }
                  >
                    اشترك الآن
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="text-xl font-bold mb-4">أحدث المنتجات</h2>
        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            لا توجد منتجات بعد. شغّل الـ API وأضف منتجات لتظهر هنا.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
