'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { StatCard } from '@/components/StatCard'
import { formatDZD } from '@/lib/format'

export default function AdminOverview() {
  const token = useAuth((s) => s.token)
  const [s, setS] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setErr('يرجى تسجيل الدخول كمدير')
      return
    }
    api<any>('/admin/stats', { token })
      .then(setS)
      .catch((e) => setErr(e.message))
  }, [token])

  if (err) return <p className="text-gray-500">{err}</p>
  if (!s) return <p className="text-gray-500">جارٍ التحميل...</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">نظرة عامة على المنصة</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="المستخدمون" value={s.users} icon="👥" />
        <StatCard label="البائعون" value={s.vendors} icon="🏪" />
        <StatCard label="بائعون بانتظار الموافقة" value={s.pendingVendors} icon="⏳" />
        <StatCard label="المنتجات" value={s.products} icon="📦" />
        <StatCard label="الطلبات" value={s.orders} icon="🧾" />
        <StatCard label="الإيرادات" value={formatDZD(s.revenue)} icon="💰" />
      </div>
    </div>
  )
}
