'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

type Coupon = {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: string
  isActive: boolean
  usedCount: number
  usageLimit: number | null
}

export default function AdminCouponsPage() {
  const { token } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '' })

  const load = () => {
    if (!token) return
    api<Coupon[]>('/coupons', { token }).then(setCoupons).catch(() => {})
  }
  useEffect(load, [token])

  const create = async () => {
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    }
    await api('/coupons', { method: 'POST', body: JSON.stringify(payload), token: token || undefined })
    setForm({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '' })
    load()
  }

  const toggle = async (c: Coupon) => {
    await api(`/coupons/${c.id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !c.isActive }),
      token: token || undefined,
    })
    load()
  }

  return (
    <div dir="rtl">
      <h1 className="mb-4 text-xl font-bold">إدارة الكوبونات</h1>
      <div className="mb-6 grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 md:grid-cols-5">
        <input
          placeholder="الرمز"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="PERCENTAGE">نسبة %</option>
          <option value="FIXED">مبلغ ثابت</option>
        </select>
        <input
          placeholder="القيمة"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <input
          placeholder="حد الاستخدام"
          value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <button onClick={create} className="rounded bg-emerald-600 px-4 py-2 text-white">
          إضافة
        </button>
      </div>
      <table className="w-full rounded-lg border bg-white text-right">
        <thead className="bg-gray-50 text-sm">
          <tr>
            <th className="p-3">الرمز</th>
            <th className="p-3">النوع</th>
            <th className="p-3">القيمة</th>
            <th className="p-3">الاستخدام</th>
            <th className="p-3">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3 font-mono">{c.code}</td>
              <td className="p-3">{c.type === 'PERCENTAGE' ? '%' : 'د.ج'}</td>
              <td className="p-3">{Number(c.value)}</td>
              <td className="p-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
              <td className="p-3">
                <button
                  onClick={() => toggle(c)}
                  className={`rounded px-3 py-1 text-sm ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}
                >
                  {c.isActive ? 'فعّال' : 'موقوف'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
