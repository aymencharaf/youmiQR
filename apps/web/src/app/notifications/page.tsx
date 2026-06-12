'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

type Notification = {
  id: string
  title: string
  body: string
  type: string
  readAt: string | null
  createdAt: string
}

export default function NotificationsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Notification[]>([])

  const load = () => {
    if (!token) return
    api<Notification[]>('/notifications', { token }).then(setItems).catch(() => {})
  }

  useEffect(load, [token])

  const markAll = async () => {
    await api('/notifications/read-all', { method: 'PATCH', token: token || undefined })
    load()
  }

  if (!token) {
    return <div className="p-8 text-center">يرجى تسجيل الدخول لعرض الإشعارات.</div>
  }

  return (
    <div className="mx-auto max-w-2xl p-4" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">الإشعارات</h1>
        <button onClick={markAll} className="text-sm text-emerald-600">
          تعليم الكل كمقروء
        </button>
      </div>
      {items.length === 0 && <p className="text-gray-500">لا توجد إشعارات.</p>}
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border p-3 ${n.readAt ? 'bg-white' : 'bg-emerald-50'}`}
          >
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-gray-600">{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
