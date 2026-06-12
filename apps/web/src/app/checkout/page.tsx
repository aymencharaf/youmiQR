'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/store/cart'
import { formatDZD } from '@/lib/format'
import { api } from '@/lib/api'

type Wilaya = { id: number; nameAr: string }

export default function CheckoutPage() {
  const { lines, total, clear } = useCart()
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    wilayaId: 16,
    street: '',
    paymentMethod: 'COD',
    shippingType: 'HOME',
  })
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    api<Wilaya[]>('/shipping/wilayas')
      .then(setWilayas)
      .catch(() => setWilayas([]))
  }, [])

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    // NOTE: requires auth token in a real flow; this is a simplified demo.
    setDone('✅ تم استلام طلبك! سيتواصل معك البائع لتأكيد التوصيل.')
    clear()
  }

  if (done) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-lg">{done}</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">إتمام الطلب</h1>
      <form onSubmit={placeOrder} className="space-y-4 bg-white p-6 rounded-xl border">
        <input
          required
          placeholder="الاسم الكامل"
          className="w-full border rounded-lg px-3 py-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          required
          placeholder="رقم الهاتف"
          className="w-full border rounded-lg px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.wilayaId}
          onChange={(e) => setForm({ ...form, wilayaId: Number(e.target.value) })}
        >
          {wilayas.map((w) => (
            <option key={w.id} value={w.id}>
              {w.id} - {w.nameAr}
            </option>
          ))}
        </select>
        <input
          placeholder="العنوان التفصيلي"
          className="w-full border rounded-lg px-3 py-2"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ship"
              checked={form.shippingType === 'HOME'}
              onChange={() => setForm({ ...form, shippingType: 'HOME' })}
            />
            توصيل للمنزل
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ship"
              checked={form.shippingType === 'STOPDESK'}
              onChange={() => setForm({ ...form, shippingType: 'STOPDESK' })}
            />
            مكتب التوصيل
          </label>
        </div>
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>الإجمالي</span>
          <span className="text-brand">{formatDZD(total())}</span>
        </div>
        <button className="w-full bg-brand text-white py-2.5 rounded-lg font-bold">
          تأكيد الطلب (الدفع عند الاستلام)
        </button>
      </form>
    </div>
  )
}
