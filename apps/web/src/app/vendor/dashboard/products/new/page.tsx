'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

export default function NewProduct() {
  const token = useAuth((s) => s.token)
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api<any[]>('/categories').then(setCategories).catch(() => setCategories([]))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await api('/products', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          categoryId: form.categoryId || undefined,
          type: 'SIMPLE',
        }),
      })
      setMsg('✅ تمت إضافة المنتج')
      setTimeout(() => router.push('/vendor/dashboard/products'), 800)
    } catch (e: any) {
      setMsg('❌ ' + e.message)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">إضافة منتج جديد</h1>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-xl border">
        <input required placeholder="اسم المنتج" className="w-full border rounded-lg px-3 py-2"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="الوصف" rows={4} className="w-full border rounded-lg px-3 py-2"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <input required type="number" placeholder="السعر (د.ج)" className="w-full border rounded-lg px-3 py-2"
            value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input required type="number" placeholder="المخزون" className="w-full border rounded-lg px-3 py-2"
            value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <select className="w-full border rounded-lg px-3 py-2"
          value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">اختر الفئة</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nameAr}</option>
          ))}
        </select>
        <button className="w-full bg-brand text-white py-2.5 rounded-lg font-bold">حفظ المنتج</button>
        {msg && <p className="text-sm text-center">{msg}</p>}
      </form>
    </div>
  )
}
