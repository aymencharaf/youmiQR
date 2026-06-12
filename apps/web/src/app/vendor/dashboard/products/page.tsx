'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { formatDZD } from '@/lib/format'

export default function VendorProducts() {
  const token = useAuth((s) => s.token)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api<any>('/vendors/me/products', { token })
      .then((d) => setItems(d.items || d || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">منتجاتي</h1>
        <Link href="/vendor/dashboard/products/new" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold">
          ➕ إضافة منتج
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">لا توجد منتجات بعد.</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right p-3">المنتج</th>
                <th className="text-right p-3">السعر</th>
                <th className="text-right p-3">المخزون</th>
                <th className="text-right p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{formatDZD(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
