'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

const SALE_TYPES: { value: 'RETAIL' | 'WHOLESALE' | 'BOTH'; label: string }[] = [
  { value: 'RETAIL', label: 'بالتجزئة' },
  { value: 'WHOLESALE', label: 'بالجملة' },
  { value: 'BOTH', label: 'الاثنان معاً' },
]

type SignResult = {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
  uploadUrl: string
}

export default function VendorRegisterPage() {
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', storeName: '' })
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE' | 'BOTH'>('BOTH')
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function onPickIdCard(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setIdCardFile(file)
    setIdCardPreview(file ? URL.createObjectURL(file) : null)
  }

  async function uploadIdCard(token: string): Promise<string | null> {
    if (!idCardFile) return null
    const sig = await api<SignResult>('/uploads/sign', {
      method: 'POST',
      token,
      body: JSON.stringify({ folder: 'youmi/id-cards' }),
    })
    const fd = new FormData()
    fd.append('file', idCardFile)
    fd.append('api_key', sig.apiKey)
    fd.append('timestamp', String(sig.timestamp))
    fd.append('signature', sig.signature)
    fd.append('folder', sig.folder)
    const res = await fetch(sig.uploadUrl, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('فشل رفع صورة البطاقة')
    const data = await res.json()
    return (data.secure_url as string) || null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!idCardFile) {
      setMsg('❌ يرجى إرفاق صورة بطاقة الهوية.')
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      const reg = await api<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, role: 'VENDOR' }),
      })
      let idCardUrl: string | null = null
      try {
        idCardUrl = await uploadIdCard(reg.accessToken)
      } catch {
        // الرفع السحابي اختياري إن لم تُضبط خدمة الرفع بعد
      }
      await api('/vendors/apply', {
        method: 'POST',
        token: reg.accessToken,
        body: JSON.stringify({ storeName: form.storeName, idCardUrl, saleType }),
      })
      setMsg('✅ تم إرسال طلب فتح المتجر! ستتم مراجعته من قبل الإدارة.')
    } catch (err: any) {
      setMsg('❌ ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">افتح متجرك على Youmi</h1>
      <p className="text-gray-500 mb-6 text-sm">ابدأ البيع لآلاف الزبائن في كل الجزائر.</p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-xl border">
        <input
          required
          placeholder="الاسم الكامل"
          className="w-full border rounded-lg px-3 py-2"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          required
          placeholder="رقم الهاتف (0550123456)"
          className="w-full border rounded-lg px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="كلمة المرور"
          className="w-full border rounded-lg px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          required
          placeholder="اسم المتجر"
          className="w-full border rounded-lg px-3 py-2"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
        />

        {/* نوع البيع */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">نوع البيع</label>
          <div className="grid grid-cols-3 gap-2">
            {SALE_TYPES.map((opt) => {
              const active = saleType === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSaleType(opt.value)}
                  className={
                    'rounded-lg border px-3 py-2 text-sm font-semibold transition ' +
                    (active
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-brand')
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* رفع صورة بطاقة الهوية */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">صورة بطاقة الهوية</label>
          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-4 cursor-pointer hover:border-brand text-gray-500">
            <span aria-hidden>📇</span>
            <span className="text-sm">{idCardFile ? 'تغيير الصورة' : 'رفع صورة بطاقة الهوية'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onPickIdCard} />
          </label>
          {idCardPreview && (
            <img
              src={idCardPreview}
              alt="معاينة بطاقة الهوية"
              className="w-full h-40 object-contain rounded-lg border bg-gray-50"
            />
          )}
          <p className="text-xs text-gray-400">مطلوبة للتحقق من هوية البائع. لن تُعرض علناً.</p>
        </div>

        <button
          disabled={loading}
          className="w-full bg-brand text-white py-2.5 rounded-lg font-bold disabled:opacity-60"
        >
          {loading ? 'جارٍ الإرسال...' : 'إنشاء المتجر'}
        </button>
        {msg && <p className="text-sm text-center">{msg}</p>}
      </form>
    </div>
  )
}
