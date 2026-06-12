'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { formatDZD } from '@/lib/format'
import { OrderCourierActions } from '@/components/OrderCourierActions'

const STATUS_AR: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
  RETURNED: 'مُرجع',
}

export default function VendorOrders() {
  const token = useAuth((s) => s.token)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api<any>('/vendors/me/orders', { token })
      .then((d) => setOrders(d.items || d || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">الطلبات</h1>
      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">لا توجد طلبات.</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right p-3">رقم الطلب</th>
                <th className="text-right p-3">الإجمالي</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">الشحن</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono">{o.orderNumber || o.id?.slice(0, 8)}</td>
                  <td className="p-3">{formatDZD(o.total)}</td>
                  <td className="p-3">{STATUS_AR[o.status] || o.status}</td>
                  <td className="p-3">
                    <OrderCourierActions orderId={o.id} status={o.status} trackingNumber={o.trackingNumber} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
