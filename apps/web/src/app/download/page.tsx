import Link from 'next/link'

export const metadata = {
  title: 'حمّل تطبيق Youmi',
  description: 'حمّل تطبيق Youmi للتسوّق من هاتفك.',
}

export default function DownloadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <section className="rounded-2xl bg-gradient-to-l from-brand to-brand-dark text-white p-8 md:p-12 text-center">
        <div className="text-5xl mb-4">📱</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">حمّل تطبيق Youmi</h1>
        <p className="text-white/90 mb-8 max-w-xl mx-auto">
          تسوّق أسرع، تابع طلباتك، واستقبل الإشعارات مباشرة على هاتفك.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold"
          >
            <span aria-hidden></span>
            App Store
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-accent text-gray-900 px-6 py-3 rounded-lg font-bold"
          >
            <span aria-hidden>▶</span>
            Google Play
          </a>
        </div>
        <p className="text-white/70 text-sm mt-6">
          سيتوفّر التطبيق قريباً على App Store و Google Play.
        </p>
      </section>

      <div className="text-center mt-8">
        <Link href="/" className="text-brand font-semibold hover:underline">
          ← العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  )
}
