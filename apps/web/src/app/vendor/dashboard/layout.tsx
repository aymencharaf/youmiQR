import { DashboardSidebar, type NavItem } from '@/components/DashboardSidebar'

const items: NavItem[] = [
  { href: '/vendor/dashboard', label: 'نظرة عامة', icon: '📊' },
  { href: '/vendor/dashboard/products', label: 'منتجاتي', icon: '📦' },
  { href: '/vendor/dashboard/products/new', label: 'إضافة منتج', icon: '➕' },
  { href: '/vendor/dashboard/orders', label: 'الطلبات', icon: '🧾' },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-50">
      <DashboardSidebar title="لوحة البائع" items={items} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
