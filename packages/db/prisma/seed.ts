import { PrismaClient, UserRole, CouponType } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Simple placeholder hash for seed only (the API uses bcrypt at runtime).
function seedHash(p: string) {
  return 'seed$' + createHash('sha256').update(p).digest('hex')
}

// The 58 wilayas of Algeria (code, Arabic, French)
const WILAYAS: [number, string, string][] = [
  [1, 'أدرار', 'Adrar'],
  [2, 'الشلف', 'Chlef'],
  [3, 'الأغواط', 'Laghouat'],
  [4, 'أم البواقي', 'Oum El Bouaghi'],
  [5, 'باتنة', 'Batna'],
  [6, 'بجاية', 'Béjaïa'],
  [7, 'بسكرة', 'Biskra'],
  [8, 'بشار', 'Béchar'],
  [9, 'البليدة', 'Blida'],
  [10, 'البويرة', 'Bouira'],
  [11, 'تمنراست', 'Tamanrasset'],
  [12, 'تبسة', 'Tébessa'],
  [13, 'تلمسان', 'Tlemcen'],
  [14, 'تيارت', 'Tiaret'],
  [15, 'تيزي وزو', 'Tizi Ouzou'],
  [16, 'الجزائر', 'Alger'],
  [17, 'الجلفة', 'Djelfa'],
  [18, 'جيجل', 'Jijel'],
  [19, 'سطيف', 'Sétif'],
  [20, 'سعيدة', 'Saïda'],
  [21, 'سكيكدة', 'Skikda'],
  [22, 'سيدي بلعباس', 'Sidi Bel Abbès'],
  [23, 'عنابة', 'Annaba'],
  [24, 'قالمة', 'Guelma'],
  [25, 'قسنطينة', 'Constantine'],
  [26, 'المدية', 'Médéa'],
  [27, 'مستغانم', 'Mostaganem'],
  [28, 'المسيلة', "M'Sila"],
  [29, 'معسكر', 'Mascara'],
  [30, 'ورقلة', 'Ouargla'],
  [31, 'وهران', 'Oran'],
  [32, 'البيض', 'El Bayadh'],
  [33, 'إليزي', 'Illizi'],
  [34, 'برج بوعريريج', 'Bordj Bou Arréridj'],
  [35, 'بومرداس', 'Boumerdès'],
  [36, 'الطارف', 'El Tarf'],
  [37, 'تندوف', 'Tindouf'],
  [38, 'تيسمسيلت', 'Tissemsilt'],
  [39, 'الوادي', 'El Oued'],
  [40, 'خنشلة', 'Khenchela'],
  [41, 'سوق أهراس', 'Souk Ahras'],
  [42, 'تيبازة', 'Tipaza'],
  [43, 'ميلة', 'Mila'],
  [44, 'عين الدفلى', 'Aïn Defla'],
  [45, 'النعامة', 'Naâma'],
  [46, 'عين تيموشنت', 'Aïn Témouchent'],
  [47, 'غرداية', 'Ghardaïa'],
  [48, 'غليزان', 'Relizane'],
  [49, 'المغير', 'El M’Ghair'],
  [50, 'المنيعة', 'El Menia'],
  [51, 'أولاد جلال', 'Ouled Djellal'],
  [52, 'بني عباس', 'Bordj Badji Mokhtar'],
  [53, 'بني عباس', 'Béni Abbès'],
  [54, 'تيميمون', 'Timimoun'],
  [55, 'تقرت', 'Touggourt'],
  [56, 'جانت', 'Djanet'],
  [57, 'المغير', 'In Salah'],
  [58, 'إن قزام', 'In Guezzam'],
]

async function main() {
  console.log('⏳ Seeding wilayas...')
  for (const [id, nameAr, nameFr] of WILAYAS) {
    await prisma.wilaya.upsert({
      where: { id },
      update: { nameAr, nameFr },
      create: { id, nameAr, nameFr },
    })
  }

  console.log('⏳ Seeding default platform shipping rates...')
  for (const [id] of WILAYAS) {
    // Coastal/north wilayas cheaper; deep south more expensive (rough defaults)
    const isSouth = id >= 30
    const home = isSouth ? 900 : 500
    const stopdesk = isSouth ? 600 : 350
    await prisma.shippingRate.upsert({
      where: { vendorId_wilayaId: { vendorId: null as any, wilayaId: id } },
      update: {},
      create: { wilayaId: id, homePrice: home, stopdeskPrice: stopdesk, etaDays: isSouth ? 5 : 3 },
    }).catch(() => {})
  }

  console.log('⏳ Seeding categories...')
  const categories = [
    ['إلكترونيات', 'electronics'],
    ['موضة وأزياء', 'fashion'],
    ['المنزل والمطبخ', 'home-kitchen'],
    ['الجمال والعناية', 'beauty'],
    ['الأطفال والألعاب', 'kids-toys'],
  ]
  for (const [nameAr, slug] of categories) {
    await prisma.category.upsert({ where: { slug }, update: { nameAr }, create: { nameAr, slug } })
  }

  console.log('⏳ Seeding admin user...')
  await prisma.user.upsert({
    where: { phone: '0700000000' },
    update: {},
    create: {
      phone: '0700000000',
      email: 'admin@youmi.dz',
      fullName: 'مدير المنصة',
      role: UserRole.SUPER_ADMIN,
      passwordHash: seedHash('admin123'),
      isVerified: true,
      phoneVerified: true,
    },
  })

  console.log('⏳ Seeding sample coupon...')
  await prisma.coupon.upsert({
    where: { code: 'YOUMI10' },
    update: {},
    create: { code: 'YOUMI10', type: CouponType.PERCENTAGE, value: 10, minOrder: 2000, maxDiscount: 1000 },
  })

  console.log('⏳ Seeding subscription plans...')
  const plans: Array<{
    name: string
    description: string
    price: number
    durationDays: number
    productLimit: number | null
    features: string[]
    sortOrder: number
  }> = [
    {
      name: 'أساسية',
      description: 'للبائعين الجدد والمتاجر الصغيرة',
      price: 1500,
      durationDays: 30,
      productLimit: 50,
      features: ['متجر خاص بك', 'دعم عبر البريد', 'دون عمولة على المبيعات'],
      sortOrder: 1,
    },
    {
      name: 'احترافية',
      description: 'للمتاجر النامية',
      price: 3500,
      durationDays: 30,
      productLimit: 300,
      features: ['كل مميزات الأساسية', 'ظهور مميز في البحث', 'دعم ذو أولوية', 'إحصائيات متقدمة'],
      sortOrder: 2,
    },
    {
      name: 'مؤسسات',
      description: 'للعلامات التجارية الكبيرة',
      price: 8000,
      durationDays: 30,
      productLimit: null,
      features: ['منتجات غير محدودة', 'مدير حساب مخصص', 'حملات ترويجية', 'وصول API'],
      sortOrder: 3,
    },
  ]
  for (const p of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: p.name } })
    if (existing) {
      await prisma.subscriptionPlan.update({ where: { id: existing.id }, data: p })
    } else {
      await prisma.subscriptionPlan.create({ data: p })
    }
  }

  console.log('✅ Seed done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
