'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartLine = {
  productId: string
  variantId?: string
  name: string
  price: number
  image?: string
  vendorName: string
  quantity: number
}

type CartState = {
  lines: CartLine[]
  add: (line: CartLine) => void
  remove: (productId: string, variantId?: string) => void
  setQty: (productId: string, qty: number, variantId?: string) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const idx = s.lines.findIndex(
            (l) => l.productId === line.productId && l.variantId === line.variantId,
          )
          if (idx >= 0) {
            const lines = [...s.lines]
            lines[idx].quantity += line.quantity
            return { lines }
          }
          return { lines: [...s.lines, line] }
        }),
      remove: (productId, variantId) =>
        set((s) => ({
          lines: s.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
        })),
      setQty: (productId, qty, variantId) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, quantity: Math.max(1, qty) }
              : l,
          ),
        })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: 'youmi-cart' },
  ),
)
