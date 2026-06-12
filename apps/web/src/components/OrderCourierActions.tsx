'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'

/** أزرار إرسال الطرد عبر الناقل وتتبّعه. */
export function OrderCourierActions({
  orderId,
  status,
  trackingNumber,
}: {
  orderId: string
  status: string
  trackingNumber?: string | null
}) {
  const token = useAuth((s) => s.token)
  const [busy, setBusy] = useState(false)
  const [tracking, setTracking] = useState<string | null>(trackingNumber || null)
  const [info, setInfo] = useState<string | null>(null)

  const dispatch = async (courier: 'YALIDINE' | 'ZR_EXPRESS') => {
    setBusy(true)
    setInfo(null)
    try {
      const res = await api<{ trackingNumber: string; provider: string }>('/shipping/parcels', {
        method: 'POST',
        body: JSON.stringify({ orderId, courier }),
        token: token || undefined,
      })
      setTracking(res.trackingNumber)
      setInfo(`تم الإرسال عبر ${res.provider}`)
    } catch (e) {
      setInfo((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const track = async () => {
    setBusy(true)
    try {
      const res = await api<any>(`/shipping/orders/${orderId}/track`, { token: token || undefined })
      setInfo(`الحالة: ${res.status || res?.Colis?.[0]?.Situation || 'غير متوفرة'}`)
    } catch (e) {
      setInfo((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (tracking) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs text-emerald-700">{tracking}</span>
        <button onClick={track} disabled={busy} className="text-xs text-blue-600 hover:underline">
          تتبّع الشحنة
        </button>
        {info && <span className="text-xs text-gray-500">{info}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <button
          onClick={() => dispatch('YALIDINE')}
          disabled={busy}
          className="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-50"
        >
          Yalidine
        </button>
        <button
          onClick={() => dispatch('ZR_EXPRESS')}
          disabled={busy}
          className="rounded bg-amber-500 px-2 py-1 text-xs text-white disabled:opacity-50"
        >
          ZR Express
        </button>
      </div>
      {info && <span className="text-xs text-red-500">{info}</span>}
    </div>
  )
}
