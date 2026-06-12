'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { formatDZD } from '@/lib/format'

type Plan = {
  id: string
  name: string
  description?: string | null
  price: string | number
  durationDays: number
  productLimit: number | null
  features: string[]
  isActive: boolean
  sortOrder: number
  _count?: { vendors: number }
}

const EMPTY = {
  name: '',
  description: '',
  price: '',
  durationDays: '30',
  productLimit: '',
  features: '',
  isActive: true,
  sortOrder: '0',
}

export default function AdminPlansPage() {
  const token = useAuth((s) => s.token)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const data = await api<Plan[]>('/subscriptions/admin/plans', { token: token || undefined })
      setPlans(data)
    } catch (e) {
      setMsg((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) load()
  }, [token])

  function resetForm() {
    setForm({ ...EMPTY })
    setEditingId(null)
  }

  function startEdit(p: Plan) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      durationDays: String(p.durationDays),
      productLimit: p.productLimit == null ? '' : String(p.productLimit),
      features: (p.features || []).join('\n'),
      isActive: p.isActive,
      sortOrder: String(p.sortOrder),
    })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      durationDays: Number(form.durationDays) || 30,
      productLimit: form.productLimit === '' ? null : Number(form.productLimit),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    }
    try {
      if (editingId) {
        await api(`/subscriptions/admin/plans/${editingId}`, {
          method: 'PATCH',
          token: token || undefined,
          body: JSON.stringify(payload),
        })
      } else {
        await api('/subscriptions/admin/plans', {
          method: 'POST',
          token: token || undefined,
          body: JSON.stringify(payload),
        })
      }
      resetForm()
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  async function remove(id: string) {
    if (!confirm('حذف هذه الخطة؟')) return
    try {
      await api(`/subscriptions/admin/plans/${id}`, {
        method: 'DELETE',
        token: token || undefined,
      })
      await load()
    } catch (e) {
      setMsg((e as Error).message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">خطط اشتراك البائعين</h1>
      <p className="text-gray-500 text-sm mb-6">إدارة خطط الاشتراك (النموذج المعتمد بدل العمولة).</p>

      {msg && <p className="text-sm text-red-600 mb-4">{msg}</p>}

      <div className="grid md:grid-cols-3 gap-6">
        {/* النموذج */}
        <form onSubmit={save} className="bg-white border rounded-xl p-4 space-y-3 h-fit">
          <h2 className="font-bold">{editingId ? 'تعديل خطة' : 'خطة جديدة'}</h2>
          <input
            required
            placeholder="اسم الخطة"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="وصف مختصر"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="number"
              placeholder="السعر (د.ج)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="المدة (يوم)"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
            />
          </div>
          <input
            type="number"
            placeholder="حد المنتجات (اتركه فارغاً = غير محدود)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.productLimit}
            onChange={(e) => setForm({ ...form, productLimit: e.target.value })}
          />
          <textarea
            placeholder="المميزات (ميزة في كل سطر)"
            className="w-full border rounded-lg px-3 py-2 text-sm h-24"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              مفعّلة
            </label>
            <input
              type="number"
              placeholder="الترتيب"
              className="w-20 border rounded-lg px-2 py-1 text-sm"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-brand text-white py-2 rounded-lg font-bold text-sm">
              {editingId ? 'حفظ التعديل' : 'إضافة الخطة'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 rounded-lg border text-sm"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* القائمة */}
        <div className="md:col-span-2 space-y-3">
          {loading ? (
            <p className="text-gray-500">جارٍ التحميل...</p>
          ) : plans.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
              لا توجد خطط بعد. أضف أول خطة.
            </div>
          ) : (
            plans.map((p) => (
              <div key={p.id} className="bg-white border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{p.name}</h3>
                      {!p.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          معطّلة
                        </span>
                      )}
                    </div>
                    {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                  </div>
                  <div className="text-left">
                    <div className="text-brand font-extrabold">{formatDZD(p.price)}</div>
                    <div className="text-xs text-gray-400">كل {p.durationDays} يوم</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="bg-gray-50 border rounded px-2 py-0.5">
                    المنتجات: {p.productLimit == null ? 'غير محدود' : p.productLimit}
                  </span>
                  <span className="bg-gray-50 border rounded px-2 py-0.5">
                    المشتركون: {p._count?.vendors ?? 0}
                  </span>
                  {(p.features || []).map((f, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 rounded px-2 py-0.5">
                      ✓ {f}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => startEdit(p)} className="text-blue-600 hover:underline">
                    تعديل
                  </button>
                  <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
