import { DashboardSidebar, type NavItem } from '@/components/DashboardSidebar'

const items: NavItem[] = [
  { href: '/admin', label: 'نظرة عامة', icon: '📊' },
  { href: '/admin/vendors', label: 'البائعون', icon: '🏪' },
  { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
  { href: '/admin/orders', label: 'الطلبات', icon: '🧾' },
  { href: '/admin/plans', label: 'خطط الاشتراك', icon: '💳' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-50">
      <DashboardSidebar title="لوحة الإدارة" items={items} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
