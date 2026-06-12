export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/80 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-bold mb-3">Youmi يومي</h3>
          <p>أكبر سوق إلكتروني متعدد البائعين في الجزائر.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">تسوق</h4>
          <ul className="space-y-2">
            <li>الفئات</li>
            <li>العروض</li>
            <li>المتاجر</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">البائعون</h4>
          <ul className="space-y-2">
            <li>افتح متجرك</li>
            <li>لوحة البائع</li>
            <li>العمولات</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">الدفع والتوصيل</h4>
          <ul className="space-y-2">
            <li>الدفع عند الاستلام</li>
            <li>BaridiMob / CCP</li>
            <li>التوصيل لـ 58 ولاية</li>
          </ul>
        </div>
      </div>
      <div className="text-center py-4 border-t border-white/10 text-xs">
        © {new Date().getFullYear()} Youmi — جميع الحقوق محفوظة
      </div>
    </footer>
  )
}
