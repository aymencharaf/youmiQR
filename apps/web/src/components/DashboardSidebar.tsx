'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'

export type NavItem = { href: string; label: string; icon: string }

export function DashboardSidebar({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuth((s) => s.logout)

  return (
    <aside className="w-60 bg-white border-l min-h-screen p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-6 text-brand">{title}</h2>
      <nav className="space-y-1 flex-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm ' +
                (active ? 'bg-brand text-white' : 'hover:bg-gray-100')
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={() => {
          logout()
          router.push('/login')
        }}
        className="text-sm text-red-600 px-3 py-2 text-right"
      >
        تسجيل الخروج
      </button>
    </aside>
  )
}
