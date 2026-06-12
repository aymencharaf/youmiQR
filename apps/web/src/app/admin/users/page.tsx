'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

const ROLE_AR: Record<string, string> = {
  CUSTOMER: 'زبون',
  VENDOR: 'بائع',
  ADMIN: 'مدير',
  SUPER_ADMIN: 'مدير عام',
}

export default function AdminUsers() {
  const token = useAuth((s) => s.token)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api<any[]>('/admin/users', { token })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">المستخدمون</h1>
      {loading ? (
        <p className="text-gray-500">جارٍ التحميل...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-right p-3">الاسم</th>
                <th className="text-right p-3">الهاتف</th>
                <th className="text-right p-3">الدور</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{ROLE_AR[u.role] || u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
