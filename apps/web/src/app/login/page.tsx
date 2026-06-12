'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuth((s) => s.setAuth)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const res = await api<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      })
      setAuth(res.accessToken, res.user)
      if (res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN') {
        router.push('/admin')
      } else if (res.user.role === 'VENDOR') {
        router.push('/vendor/dashboard')
      } else {
        router.push('/')
      }
    } catch (e: any) {
      setErr('❌ ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h1>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-xl border">
        <input
          required
          placeholder="رقم الهاتف"
          className="w-full border rounded-lg px-3 py-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="كلمة المرور"
          className="w-full border rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-brand text-white py-2.5 rounded-lg font-bold disabled:opacity-60"
        >
          {loading ? '...' : 'دخول'}
        </button>
        {err && <p className="text-sm text-center text-red-600">{err}</p>}
      </form>
    </div>
  )
}
