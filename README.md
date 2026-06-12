# 🛒 Youmi — منصة التجارة الإلكترونية متعددة البائعين (الجزائر)

منصة تجارة إلكترونية (Marketplace) متعددة البائعين مصممة خصيصاً للسوق الجزائري:
واجهة عربية (RTL)، الدينار الجزائري (DZD)، الدفع عند الاستلام، التوصيل لـ 58 ولاية،
وتكامل مع شركات الشحن الجزائرية.

## 🧱 البنية (Monorepo)

```
youmi/
├── apps/
│   ├── api/        # الخادم (NestJS + Prisma + JWT)
│   └── web/        # الواجهة (Next.js 14 + Tailwind + RTL)
├── packages/
│   └── db/         # مخطط Prisma + بيانات الولايات (seed)
├── docker-compose.yml  # PostgreSQL + Redis
└── turbo.json
```

## 🛠️ التقنيات

| الطبقة | التقنية |
|--------|---------|
| الواجهة الأمامية | Next.js 14 (App Router), React, TailwindCSS, Zustand |
| الخادم | NestJS 10, Passport JWT, class-validator |
| قاعدة البيانات | PostgreSQL + Prisma ORM |
| الكاش | Redis |
| الإدارة | pnpm workspaces + Turborepo |

## ✅ المتطلبات

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Docker (لتشغيل PostgreSQL و Redis) أو PostgreSQL مثبّت محلياً

## 🚀 خطوات التثبيت

```bash
# 1) تثبيت الحزم
pnpm install

# 2) نسخ متغيرات البيئة
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local

# 3) تشغيل قاعدة البيانات و Redis عبر Docker
docker compose up -d

# 4) توليد عميل Prisma وتطبيق المخطط
pnpm db:generate
pnpm db:migrate

# 5) تعبئة البيانات الأولية (58 ولاية + فئات + حساب مدير + كوبون)
pnpm db:seed

# 6) تشغيل المشروع كاملاً (الواجهة + الخادم)
pnpm dev
```

- الواجهة: http://localhost:3000
- الخادم (API): http://localhost:4000/api

### 🔑 حساب المدير الافتراضي (بعد seed)

| الهاتف | كلمة المرور |
|--------|-------------|
| 0700000000 | admin123 |

> ⚠️ غيّر كلمة المرور والأسرار في `.env` قبل النشر.

## 📡 أهم نقاط الـ API

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| POST | `/api/auth/register` | تسجيل مستخدم/بائع |
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/refresh` | تجديد الجلسة |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |
| GET | `/api/products` | قائمة المنتجات (بحث + فلترة) |
| GET | `/api/products/:slug` | تفاصيل منتج |
| POST | `/api/products` | إضافة منتج (بائع) |
| GET | `/api/categories` | الفئات |
| POST | `/api/vendors/apply` | طلب فتح متجر |
| GET | `/api/vendors/:slug` | صفحة المتجر العامة |
| GET | `/api/vendors/me/dashboard` | إحصائيات البائع |
| POST | `/api/orders` | إنشاء طلب |
| GET | `/api/orders` | طلباتي |
| GET | `/api/shipping/wilayas` | قائمة الولايات الـ58 |
| GET | `/api/shipping/rates?wilayaId=16` | أسعار التوصيل لولاية |

## 💳 طرق الدفع المدعومة

- **الدفع عند الاستلام (COD)** — جاهز
- **CIB / الذهبية (SATIM)** — بنية جاهزة، يتطلب مفاتيح API
- **BaridiMob / CCP** — تحويل يدوي
- **المحفظة (Wallet)** — مدمجة في المخطط

## 🚚 الشحن

- جدول أسعار لكل ولاية من الـ58 (توصيل للمنزل / مكتب).
- محوّلات (Adapters) جاهزة لـ **Yalidine** و **ZR Express** في
  `apps/api/src/shipping/shipping.service.ts` — أضف مفاتيح API في `.env`.

## 🗺️ خارطة الطريق (المراحل القادمة)

- [ ] لوحة تحكم البائع الكاملة (إدارة المنتجات والطلبات)
- [ ] لوحة تحكم المدير (Super Admin)
- [ ] تكامل فعلي مع بوابة SATIM وشركات الشحن
- [ ] الدردشة بين المشتري والبائع (Realtime)
- [ ] الإشعارات (SMS/Email/Firebase)
- [ ] البيع بالأجل (الأقساط) والكوبونات المتقدمة
- [ ] تطبيق الهاتف (React Native)

## 📄 الترخيص

مشروع خاص — © Youmi.
