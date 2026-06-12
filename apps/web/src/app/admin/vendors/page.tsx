'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

const STATUS_AR: Record<string, string> = {
  PENDING: 'بانتظار المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  SUSPENDED: 'موقوف',
}

export default function AdminVendors() {
  const token = useAuth((s) => s.token)
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!token) return
    api<any[]>('/admin/vendors', { token })
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(id: string, status: string) {
    await api(`/admin/vendors/${id}/status`, {
      method: 'PATCH',
      token: token || undefined,
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">إدارة البائعين</h1>
      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right p-3">المتجر</th>
                <th className="text-right p-3">صاحبه</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3 font-medium">{v.storeName}</td>
                  <td className="p-3">{v.user?.fullName} ({v.user?.phone})</td>
                  <td className="p-3">{STATUS_AR[v.status] || v.status}</td>
                  <td className="p-3 flex gap-2">
                    {v.status !== 'APPROVED' && (
                      <button onClick={() => setStatus(v.id, 'APPROVED')} className="text-green-600 text-xs font-semibold">اعتماد</button>
                    )}
                    {v.status !== 'REJECTED' && (
                      <button onClick={() => setStatus(v.id, 'REJECTED')} className="text-red-600 text-xs font-semibold">رفض</button>
                    )}
                    {v.status === 'APPROVED' && (
                      <button onClick={() => setStatus(v.id, 'SUSPENDED')} className="text-yellow-600 text-xs font-semibold">إيقاف</button>
                    )}
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
