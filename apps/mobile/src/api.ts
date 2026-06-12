import Constants from 'expo-constants'

const API_URL =
  (Constants.expoConfig?.extra as any)?.apiUrl || 'http://10.0.2.2:4000/api'

export async function api<T = any>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error('حدث خطأ أثناء الاتصال بالخادم')
  return res.json()
}

export function formatDZD(value: number | string) {
  const n = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('ar-DZ').format(n) + ' د.ج'
}

export type Product = {
  id: string
  name: string
  slug: string
  price: string
  images: { url: string }[]
  vendor: { storeName: string }
}
