import Link from 'next/link'

type Store = {
  id: string
  storeName: string
  slug: string
  logoUrl?: string | null
}

/**
 * سلايدر متحرك (marquee) يعرض شعارات المتاجر المشتركة.
 * يتم تكرار القائمة مرتين لتحرك لا نهائي سلس.
 */
export function StoreLogosMarquee({ stores }: { stores: Store[] }) {
  if (!stores || stores.length === 0) return null
  const loop = [...stores, ...stores]
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4 text-center">متاجرنا المشتركة</h2>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white py-6">
        {/* تدرج على الحواف */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="flex w-max items-center gap-10 animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <Link
              key={s.id + '-' + i}
              href={'/vendor/' + s.slug}
              title={s.storeName}
              className="flex flex-col items-center gap-2 shrink-0 w-28"
            >
              <div className="h-20 w-20 rounded-full bg-gray-50 border flex items-center justify-center overflow-hidden">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt={s.storeName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-brand">
                    {s.storeName?.charAt(0) || '؟'}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 text-center line-clamp-1 w-full">
                {s.storeName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
