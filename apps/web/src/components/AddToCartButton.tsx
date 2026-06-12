'use client'
import { useState } from 'react'
import { useCart, type CartLine } from '@/store/cart'

export function AddToCartButton({ line }: { line: CartLine }) {
  const add = useCart((s) => s.add)
  const [added, setAdded] = useState(false)
  return (
    <button
      onClick={() => {
        add(line)
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
      }}
      className="bg-brand text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-dark transition"
    >
      {added ? '✓ تمت الإضافة' : 'أضف إلى السلة'}
    </button>
  )
}
