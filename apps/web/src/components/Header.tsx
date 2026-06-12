import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-brand text-white sticky top-0 z-50 shadow">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="text-2xl font-extrabold">
          Youmi <span className="text-accent">يومي</span>
        </Link>
        <div className="flex-1">
          <form action="/products" className="max-w-xl mx-auto">
            <input
              name="q"
              placeholder="ابحث عن منتج، علامة تجارية، أو متجر..."
              className="w-full rounded-lg px-4 py-2 text-gray-800 outline-none"
            />
          </form>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cart" className="hover:text-accent">🛒 السلة</Link>
          <Link href="/account" className="hover:text-accent">حسابي</Link>
          <Link href="/vendor/register" className="bg-accent text-gray-900 px-3 py-1.5 rounded-lg font-semibold">
            بع معنا
          </Link>
        </nav>
      </div>
    </header>
  )
}
