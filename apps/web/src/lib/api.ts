const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function api<T = any>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'حدث خطأ' }))
    throw new Error(err.message || 'حدث خطأ غير متوقع')
  }
  return res.json()
}

export type Product = {
  id: string
  name: string
  slug: string
  price: string
  compareAtPrice?: string
  images: { url: string }[]
  vendor: { storeName: string; slug: string }
}
