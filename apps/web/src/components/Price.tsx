'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatDZD } from '@/lib/format'
import { useAuth } from '@/store/auth'

/**
 * يعرض السعر للمستخدمين المسجّلين فقط.
 * للزوّار يُعرض رابط "سجّل لرؤية السعر".
 */
export function Price({
  value,
  compareAt,
  size = 'sm',
}: {
  value: number | string
  compareAt?: number | string | null
  size?: 'sm' | 'lg'
}) {
  const token = useAuth((s) => s.token)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const priceClass = size === 'lg' ? 'text-3xl font-extrabold text-brand' : 'text-brand font-bold'

  // تجنّب عدم تطابق الترطيب (hydration) ريثما تجهز حالة الدخول
  if (!mounted) {
    return <span className={priceClass + ' opacity-0'}>{formatDZD(value)}</span>
  }

  if (!token) {
    return (
      <Link
        href="/login"
        className={
          'inline-flex items-center gap-1 font-semibold text-brand hover:underline ' +
          (size === 'lg' ? 'text-base' : 'text-sm')
        }
      >
        <span aria-hidden>🔒</span>
        سجّل لرؤية السعر
      </Link>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className={priceClass}>{formatDZD(value)}</span>
      {compareAt ? (
        <span className="text-xs text-gray-400 line-through">{formatDZD(compareAt)}</span>
      ) : null}
    </span>
  )
}
