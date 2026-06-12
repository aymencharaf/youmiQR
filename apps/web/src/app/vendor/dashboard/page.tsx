'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { StatCard } from '@/components/StatCard'
import { formatDZD } from '@/lib/format'

export default function VendorOverview() {
  const token = useAuth((s) => s.token)
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setErr('يرجى تسجيل الدخول')
      return
    }
    api<any>('/vendors/me/dashboard', { token })
      .then(setData)
      .catch((e) => setErr(e.message))
  }, [token])

  if (err) return <p className="text-gray-500">{err}</p>
  if (!data) return <p className="text-gray-500">جارٍ التحميل...</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">نظرة عامة</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="المنتجات" value={data.productCount ?? 0} icon="📦" />
        <StatCard label="الطلبات" value={data.orderCount ?? 0} icon="🧾" />
        <StatCard label="الإيرادات" value={formatDZD(data.revenue ?? 0)} icon="💰" />
        <StatCard label="العمولة" value={formatDZD(data.commission ?? 0)} icon="📉" />
      </div>
    </div>
  )
}
