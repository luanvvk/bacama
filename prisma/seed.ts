import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Seed data mirrors src/constants/*.ts so the DB reproduces what the UI already
// renders. Vietnamese copy is taken verbatim from coffee-shop-ui.html where it
// exists; the rest is a plain translation that still needs a native-speaker
// pass before launch (BUILD-PLAN.md blocker B1-b).
//
// Idempotent: every write is an upsert on a unique key, so re-running is safe.

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const SITES = [
  {
    slug: 'ngo-quyen',
    city: 'Đà Nẵng',
    nameVi: 'Ngô Quyền',
    nameEn: 'Ngô Quyền',
    addressVi: '27 Ngô Quyền, Hải Châu, Đà Nẵng · Bánh nướng tại chỗ',
    addressEn: '27 Ngo Quyen, Hai Chau, Da Nang · Pastries baked on site',
    hoursVi: 'Thứ 2–CN · 07:00 – 19:00',
    hoursEn: 'Mon–Sun · 7 a.m. – 7 p.m.',
    opensAt: null,
  },
  {
    slug: 'hoi-an-pho-co',
    city: 'Hội An',
    nameVi: 'Phố cổ',
    nameEn: 'Old town',
    addressVi: '14 Phan Bội Châu, Minh An, Hội An · Cupping cuối tuần',
    addressEn: '14 Phan Boi Chau, Minh An, Hoi An · Weekend cupping',
    hoursVi: 'Thứ 3–CN · 07:30 – 18:00',
    hoursEn: 'Tue–Sun · 7:30 a.m. – 6 p.m.',
    opensAt: null,
  },
  {
    slug: 'an-thuan',
    city: 'Đà Nẵng',
    nameVi: 'An Thuận',
    nameEn: 'An Thuận',
    addressVi: '8 An Thuận 12, Ngũ Hành Sơn, Đà Nẵng · Lò rang, phòng học, sân sau',
    addressEn: '8 An Thuan 12, Ngu Hanh Son, Da Nang · Roastery, classroom, garden',
    hoursVi: 'Mở cửa · 09.2026',
    hoursEn: 'Opens · 09.2026',
    opensAt: new Date('2026-09-01T00:00:00Z'),
  },
];

const PRODUCTS = [
  {
    slug: 'dalat-washed',
    category: 'coffee' as const,
    nameVi: 'Đà Lạt Washed',
    nameEn: 'Đà Lạt Washed',
    descriptionVi:
      'Sạch và ngọt. Rang vừa để giữ hương mận khô và mật ong, hậu bạc hà nhẹ khi nguội.',
    descriptionEn:
      'Clean and sweet. Roasted medium to keep the dried plum and honey, with a light mint finish as it cools.',
    originVi: 'Đà Lạt, Lâm Đồng · 1.500 m · Sơ chế ướt',
    originEn: 'Đà Lạt, Lâm Đồng · 1,500 m · Washed',
    originStoryVi:
      'Từ ba nông hộ nhỏ quanh Cầu Đất ở độ cao 1.450–1.600 m. Sơ chế ướt, phơi nhà kính 14 ngày. Chúng tôi mua trực tiếp từ các nông hộ này từ 2019.',
    originStoryEn:
      'From three smallholder plots around Cầu Đất at 1,450–1,600 m. Washed, then dried under greenhouse for 14 days. We have bought direct from these farms since 2019.',
    tastingNotesVi: ['Mận khô', 'Mật ong', 'Bạc hà', 'Rang vừa'],
    tastingNotesEn: ['Dried plum', 'Honey', 'Mint', 'Medium roast'],
    roastLevel: 'medium' as const,
    weightOptions: ['250g', '500g', '1kg'],
    grindOptions: ['whole_bean', 'phin', 'espresso', 'pour_over'],
    priceVnd: 280_000,
    stock: 42,
    reorderLevel: 10,
    roastDate: daysAgo(3),
    featuredUntil: daysFromNow(7),
    brewGuides: [
      {
        method: 'phin',
        ratio: '25 g · 120 ml',
        detailVi: 'Xay vừa-thô · 4–5 phút',
        detailEn: 'Medium-coarse · 4–5 min',
      },
      {
        method: 'espresso',
        ratio: '18 g → 36 g',
        detailVi: '26–30 s · 93 °C',
        detailEn: '26–30 s · 93 °C',
      },
      {
        method: 'pour_over',
        ratio: '15 g · 250 ml',
        detailVi: 'Xay vừa · 2:45',
        detailEn: 'Medium grind · 2:45',
      },
      {
        method: 'cold_brew',
        ratio: '70 g · 1 L',
        detailVi: '16 giờ, lạnh',
        detailEn: '16 hours, cold',
      },
    ],
  },
  {
    slug: 'son-la-natural',
    category: 'coffee' as const,
    nameVi: 'Sơn La Natural',
    nameEn: 'Sơn La Natural',
    descriptionVi: 'Ca cao, mạch nha, hậu ngọt dài.',
    descriptionEn: 'Cocoa, malt, a long sweet finish.',
    originVi: 'Sơn La · Sơ chế khô',
    originEn: 'Sơn La · Natural process',
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: ['Ca cao', 'Mạch nha', 'Rang đậm'],
    tastingNotesEn: ['Cocoa', 'Malt', 'Dark roast'],
    roastLevel: 'dark' as const,
    weightOptions: ['250g', '1kg'],
    grindOptions: ['whole_bean', 'phin'],
    priceVnd: 265_000,
    stock: 6,
    reorderLevel: 10,
    roastDate: daysAgo(1),
    featuredUntil: null,
    brewGuides: [],
  },
  {
    slug: 'house-blend',
    category: 'coffee' as const,
    nameVi: 'Blend Nhà',
    nameEn: 'House Blend',
    descriptionVi: 'Đà Lạt + Sơn La. Ngon với phin và với espresso.',
    descriptionEn: 'Đà Lạt + Sơn La. Good in a phin and in espresso.',
    originVi: 'Đà Lạt + Sơn La',
    originEn: 'Đà Lạt + Sơn La',
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: ['Cân bằng', 'Ngọt hậu', 'Rang vừa'],
    tastingNotesEn: ['Balanced', 'Sweet finish', 'Medium roast'],
    roastLevel: 'medium' as const,
    weightOptions: ['250g', '1kg'],
    grindOptions: ['whole_bean', 'phin', 'espresso'],
    priceVnd: 230_000,
    stock: 31,
    reorderLevel: 10,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [],
  },
  {
    slug: 'three-origins-box',
    category: 'gift' as const,
    nameVi: 'Hộp Ba Vùng',
    nameEn: 'Three Origins Box',
    descriptionVi: 'Ba gói 250 g kèm thẻ ghi ngày rang.',
    descriptionEn: 'Three 250 g bags with a roast-date card.',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['3x250g'],
    grindOptions: ['whole_bean'],
    priceVnd: 720_000,
    stock: 12,
    reorderLevel: 4,
    roastDate: daysAgo(1),
    featuredUntil: null,
    brewGuides: [],
  },
];

const BAKERY_ITEMS = [
  {
    slug: 'croissant-aux-amandes',
    nameVi: 'Croissant hạnh nhân',
    nameEn: 'Croissant aux amandes',
    descriptionVi: 'Bơ Pháp, hạnh nhân nghiền, đường mía. Nướng 5 giờ — bán hết trưa.',
    descriptionEn: 'French butter, ground almond, cane sugar. Baked at five — gone by noon.',
    priceVnd: 45_000,
    bakesAt: '05:00',
    sellOutBy: '12:00',
    handoff: 'grabfood' as const,
  },
  {
    slug: 'kouign-amann',
    nameVi: 'Kouign-amann',
    nameEn: 'Kouign-amann',
    descriptionVi: 'Bơ Pháp, caramel giòn, hơi mặn.',
    descriptionEn: 'French butter, crisp caramel, lightly salted.',
    priceVnd: 52_000,
    bakesAt: '05:20',
    sellOutBy: '12:00',
    handoff: 'pickup' as const,
  },
];

const COURSES = [
  {
    slug: 'latte-art',
    format: 'online' as const,
    titleVi: 'Latte Art',
    titleEn: 'Latte Art',
    metaVi: '9 bài',
    metaEn: '9 lessons',
    descriptionVi: 'Video kèm bình luận, thi bằng ảnh. Học ở nhà, thi ở quán.',
    descriptionEn:
      'Video lessons with live discussion, a photo-based exam. Learn at home, finish at a café.',
    availabilityVi: 'Bài 1 miễn phí',
    availabilityEn: 'Lesson 1 free',
    priceVnd: 790_000,
    modules: [
      {
        titleVi: 'Học phần 1 · Nền tảng',
        titleEn: 'Module 1 · Foundations',
        lessons: [
          {
            titleVi: 'Sữa và microfoam',
            titleEn: 'Milk and microfoam',
            durationSec: 760,
            isFreePreview: true,
          },
          {
            titleVi: 'Rót cơ bản',
            titleEn: 'The basic pour',
            durationSec: 558,
            isFreePreview: false,
          },
          {
            titleVi: 'Trái tim — rót chậm, kết gọn',
            titleEn: 'The heart — pour slow, finish clean',
            durationSec: 665,
            isFreePreview: false,
            bodyVi:
              'Trái tim học trước vì nó dạy ba thứ cùng lúc: độ cao khi rót, tốc độ dòng, và thời điểm cắt qua. Trái tim lệch gần như luôn do hạ bình quá muộn. Xem từ 4:10 để thấy hai kiểu rót cạnh nhau.',
            bodyEn:
              'The heart comes first because it teaches three things at once: pour height, flow speed, and when to cut through. A lopsided heart is nearly always a jug lowered too late. Watch from 4:10 to see the two pours side by side.',
          },
          { titleVi: 'Rosetta', titleEn: 'Rosetta', durationSec: 862, isFreePreview: false },
        ],
      },
      {
        titleVi: 'Học phần 2 · Hình nâng cao',
        titleEn: 'Module 2 · Advanced figures',
        lessons: [
          { titleVi: 'Tulip', titleEn: 'Tulip', durationSec: 651, isFreePreview: false },
          { titleVi: 'Thiên nga', titleEn: 'The swan', durationSec: 963, isFreePreview: false },
          {
            titleVi: 'Sửa lỗi thường gặp',
            titleEn: 'Fixing common faults',
            durationSec: 750,
            isFreePreview: false,
          },
        ],
      },
      {
        titleVi: 'Học phần 3 · Bài cuối',
        titleEn: 'Module 3 · Final',
        lessons: [
          {
            titleVi: 'Chuẩn bị bài dự thi',
            titleEn: 'Preparing your submission',
            durationSec: 524,
            isFreePreview: false,
          },
          {
            titleVi: 'Gửi bài & nhận chứng nhận',
            titleEn: 'Submit & get certified',
            durationSec: null,
            isFreePreview: false,
          },
        ],
      },
    ],
  },
  {
    slug: 'viennoiserie',
    format: 'in_person' as const,
    titleVi: 'Làm bánh Viennoiserie',
    titleEn: 'Viennoiserie Weekend',
    metaVi: 'Hội An · cuối tuần',
    metaEn: 'Hội An · weekend',
    descriptionVi: '2 ngày tại Phố cổ Hội An, 8 người, bơ Pháp. Cán tay, ủ lạnh, nướng.',
    descriptionEn:
      "Two days in Hội An's old town, eight people, French butter. Hand-laminated, cold-proofed, baked.",
    availabilityVi: 'Còn ít chỗ',
    availabilityEn: 'Limited seats',
    priceVnd: 3_200_000,
    modules: [],
  },
  {
    slug: 'cupping-origin',
    format: 'online' as const,
    titleVi: 'Cupping & Origin',
    titleEn: 'Cupping & Origin',
    metaVi: 'cảm quan',
    metaEn: 'sensory',
    descriptionVi: 'Cà phê origin Sơn La và Đà Lạt; thi bằng cảm quan. Bắt đầu lúc nào cũng được.',
    descriptionEn: 'Sơn La and Đà Lạt origins; a sensory-based final. Start whenever.',
    availabilityVi: 'Bắt đầu bất kỳ lúc nào',
    availabilityEn: 'Start any time',
    priceVnd: 1_290_000,
    modules: [],
  },
  {
    slug: 'barista-foundations',
    format: 'hybrid' as const,
    titleVi: 'Căn bản Pha chế',
    titleEn: 'Barista Foundations',
    metaVi: '6 tuần online + thi tại quán',
    metaEn: '6 weeks online + final at a café',
    descriptionVi:
      '24 bài online; thi cuối khoá tại Phố cổ Hội An. Khoá nền tảng cho nhân viên và chủ quán.',
    descriptionEn:
      '24 online lessons; final exam on-site in Hội An. A foundation course for staff and shop owners.',
    availabilityVi: 'Còn ít chỗ',
    availabilityEn: 'Limited seats',
    priceVnd: 1_890_000,
    modules: [],
  },
];

const ANNOUNCEMENTS = [
  {
    titleVi: 'Lô mới: Đà Lạt Washed',
    titleEn: 'New batch: Đà Lạt Washed',
    bodyVi: 'Ra lò sáng nay, giảm 10% gói 1 kg đến Chủ nhật.',
    bodyEn: 'Out this morning, 10% off 1 kg bags until Sunday.',
    startsAt: daysAgo(1),
    endsAt: daysFromNow(6),
    siteSlug: null,
  },
  {
    titleVi: 'Quán 03 mở cửa tháng 9',
    titleEn: 'Site 03 opens in September',
    bodyVi: 'An Thuận — lò rang, phòng học và sân sau.',
    bodyEn: 'An Thuận — a roastery, classroom and garden.',
    startsAt: new Date('2026-09-01T00:00:00Z'),
    endsAt: null,
    siteSlug: 'an-thuan',
  },
];

const seed = async () => {
  const sites = new Map<string, string>();
  for (const site of SITES) {
    const row = await prisma.site.upsert({
      where: { slug: site.slug },
      update: site,
      create: site,
    });
    sites.set(site.slug, row.id);
  }
  console.log(`sites: ${sites.size}`);

  const products = new Map<string, string>();
  for (const { brewGuides, ...product } of PRODUCTS) {
    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    products.set(product.slug, row.id);

    await prisma.brewGuide.deleteMany({ where: { productId: row.id } });
    if (brewGuides.length) {
      await prisma.brewGuide.createMany({
        data: brewGuides.map((guide, order) => ({ ...guide, order, productId: row.id })),
      });
    }
  }
  console.log(`products: ${products.size}`);

  // Fresh bakes are made at the site with an on-site oven (Ngô Quyền).
  const bakerySiteId = sites.get('ngo-quyen')!;
  for (const item of BAKERY_ITEMS) {
    await prisma.bakeryItem.upsert({
      where: { siteId_slug: { siteId: bakerySiteId, slug: item.slug } },
      update: item,
      create: { ...item, siteId: bakerySiteId },
    });
  }
  console.log(`bakery items: ${BAKERY_ITEMS.length}`);

  await prisma.site.update({
    where: { slug: 'ngo-quyen' },
    data: { todaysRoastProductId: products.get('dalat-washed') },
  });
  await prisma.site.update({
    where: { slug: 'hoi-an-pho-co' },
    data: { todaysRoastProductId: products.get('son-la-natural') },
  });

  let lessonCount = 0;
  for (const { modules, ...course } of COURSES) {
    const row = await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });

    // Modules have no natural key; replace wholesale so re-seeding stays clean.
    await prisma.courseModule.deleteMany({ where: { courseId: row.id } });
    for (const [order, { lessons, ...courseModule }] of modules.entries()) {
      const moduleRow = await prisma.courseModule.create({
        data: { ...courseModule, order, courseId: row.id },
      });
      await prisma.lesson.createMany({
        data: lessons.map((lesson, lessonOrder) => ({
          ...lesson,
          order: lessonOrder,
          moduleId: moduleRow.id,
        })),
      });
      lessonCount += lessons.length;
    }
  }
  console.log(`courses: ${COURSES.length} (lessons: ${lessonCount})`);

  for (const { siteSlug, ...announcement } of ANNOUNCEMENTS) {
    const siteId = siteSlug ? sites.get(siteSlug) : null;
    const existing = await prisma.announcement.findFirst({
      where: { titleEn: announcement.titleEn },
    });
    if (existing) {
      await prisma.announcement.update({
        where: { id: existing.id },
        data: { ...announcement, siteId },
      });
    } else {
      await prisma.announcement.create({ data: { ...announcement, siteId } });
    }
  }
  console.log(`announcements: ${ANNOUNCEMENTS.length}`);
};

seed()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
