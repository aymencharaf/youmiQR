'use client'
import Link from 'next/link'
import { useCart } from '@/store/cart'
import { formatDZD } from '@/lib/format'

export default function CartPage() {
  const { lines, setQty, remove, total } = useCart()

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">سلتك فارغة.</p>
        <Link href="/products" className="text-brand font-semibold">تصفّح المنتجات</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">سلة التسوق</h1>
      <div className="space-y-4">
        {lines.map((l) => (
          <div
            key={l.productId + (l.variantId || '')}
            className="bg-white rounded-xl border p-4 flex items-center gap-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.image} alt={l.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{l.name}</h3>
              <p className="text-sm text-gray-500">{l.vendorName}</p>
              <p className="text-brand font-bold">{formatDZD(l.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={l.quantity}
              onChange={(e) => setQty(l.productId, Number(e.target.value), l.variantId)}
              className="w-16 border rounded-lg px-2 py-1 text-center"
            />
            <button onClick={() => remove(l.productId, l.variantId)} className="text-red-500 text-sm">
              حذف
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border p-6 mt-6 flex items-center justify-between">
        <span className="text-lg">الإجمالي (بدون التوصيل)</span>
        <span className="text-2xl font-extrabold text-brand">{formatDZD(total())}</span>
      </div>
      <Link
        href="/checkout"
        className="block text-center bg-brand text-white px-6 py-3 rounded-lg font-bold mt-4"
      >
        إتمام الطلب
      </Link>
    </div>
  )
}
