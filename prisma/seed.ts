import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Seed data sources, in order of trust:
//  1. Real data pulled from the live GrabFood listing (merchant ID
//     5-C3KEGFM1VGN2N2, "BACAMA COFFEE & MORE") — real address, hours, and a
//     representative subset of the real 92-item menu. Vietnamese copy here is
//     the business's own, taken verbatim.
//  2. coffee-shop-ui.html's fictional multi-site roastery narrative, kept for
//     the two not-yet-real sites (Hội An, An Thuận) per the agreed roadmap
//     story — see docs/BUILD-PLAN.md B0-c / site-reconciliation note.
// The fictional single-origin coffee products (Đà Lạt Washed, Sơn La Natural,
// House Blend, Three Origins Box) are retired here — the real menu sells
// packaged coffee by bean type, not by an invented origin story, and keeping
// both would give Product two conflicting sources of truth.
//
// Idempotent: every write is an upsert on a unique key, so re-running is safe.
// A rename/cleanup step retargets or removes rows superseded by real data
// rather than leaving them as stale duplicates.

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

// Slugs retired by real data — removed before re-seeding so re-runs don't
// leave stale duplicates alongside the rows that replaced them.
const RETIRED_PRODUCT_SLUGS = [
  'dalat-washed',
  'son-la-natural',
  'house-blend',
  'three-origins-box',
];
const RETIRED_BAKERY_SLUGS = ['croissant-aux-amandes', 'kouign-amann'];
// Announcements are matched by titleEn (no slug on that model) — a renamed
// title can't match its old row, so the old title is retired explicitly
// rather than left as an orphan.
const RETIRED_ANNOUNCEMENT_TITLES_EN = ['New batch: Đà Lạt Washed'];

const SITES = [
  {
    // Real, live location (GrabFood merchant 5-C3KEGFM1VGN2N2). Was seeded
    // under slug "ngo-quyen" with a fictional address; renamed below.
    slug: 'ly-tu-trong',
    city: 'Đà Nẵng',
    nameVi: 'Lý Tự Trọng',
    nameEn: 'Lý Tự Trọng',
    addressVi: 'K154/6 Lý Tự Trọng, Phường Thanh Bình, Quận Hải Châu, Đà Nẵng',
    addressEn: 'K154/6 Ly Tu Trong, Thanh Binh Ward, Hai Chau District, Da Nang',
    hoursVi: 'Hằng ngày · 07:00 – 21:00',
    hoursEn: 'Every day · 7 a.m. – 9 p.m.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/merchants/5-C3KEGFM1VGN2N2/hero/811e0385d45c4a0681c6af48ae77ff3d_1652529908962123339.webp',
    opensAt: null,
  },
  {
    // Fictional — no real listing yet. Kept per the roadmap's multi-site story.
    slug: 'hoi-an-pho-co',
    city: 'Hội An',
    nameVi: 'Phố cổ',
    nameEn: 'Old town',
    addressVi: '14 Phan Bội Châu, Minh An, Hội An · Cupping cuối tuần',
    addressEn: '14 Phan Boi Chau, Minh An, Hoi An · Weekend cupping',
    hoursVi: 'Thứ 3–CN · 07:30 – 18:00',
    hoursEn: 'Tue–Sun · 7:30 a.m. – 6 p.m.',
    imageUrl: null,
    opensAt: null,
  },
  {
    // Fictional, not yet open.
    slug: 'an-thuan',
    city: 'Đà Nẵng',
    nameVi: 'An Thuận',
    nameEn: 'An Thuận',
    addressVi: '8 An Thuận 12, Ngũ Hành Sơn, Đà Nẵng · Lò rang, phòng học, sân sau',
    addressEn: '8 An Thuan 12, Ngu Hanh Son, Da Nang · Roastery, classroom, garden',
    hoursVi: 'Mở cửa · 09.2026',
    hoursEn: 'Opens · 09.2026',
    imageUrl: null,
    opensAt: new Date('2026-09-01T00:00:00Z'),
  },
];

// Real packaged coffee (GrabFood category "Cà phê đóng gói"). Sold by bean
// type, not by the fictional single-origin story it replaces.
const PRODUCTS = [
  {
    slug: 'bag-arabica-250g',
    category: 'coffee' as const,
    nameVi: 'Túi 250g hạt cf 100% Arabica',
    nameEn: '250g Bag · 100% Arabica',
    descriptionVi:
      'Cà phê rang xay tại xưởng. Arabica thiên về hương thơm dịu nhẹ và hậu vị chua dịu.',
    descriptionEn: 'Roasted in-house. Arabica leans toward a gentle aroma and a mild sour finish.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025020307455071970/photo/menueditor_item_634034960633486ea6368b22b10e2a77_1776934552297883360.webp',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['250g'],
    grindOptions: ['whole_bean'],
    priceVnd: 200_000,
    stock: 30,
    reorderLevel: 10,
    roastDate: daysAgo(2),
    featuredUntil: daysFromNow(7),
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
  {
    slug: 'bag-robusta-250g',
    category: 'coffee' as const,
    nameVi: 'Túi 250g hạt cf 100% Robusta',
    nameEn: '250g Bag · 100% Robusta',
    descriptionVi: 'Cà phê rang xay tại xưởng. Robusta thiên về vị đậm đắng, phù hợp để pha phin.',
    descriptionEn: 'Roasted in-house. Robusta leans bold and bitter — good for a phin brew.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025020307385455927/photo/menueditor_item_a3a193da624e4bfc93fa35efc1390233_1776934597507254353.webp',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['250g'],
    grindOptions: ['whole_bean', 'phin'],
    priceVnd: 145_000,
    stock: 30,
    reorderLevel: 10,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
  {
    slug: 'bag-liberica-250g',
    category: 'coffee' as const,
    nameVi: 'Túi 250g hạt cf 100% Liberica',
    nameEn: '250g Bag · 100% Liberica',
    descriptionVi: 'Cà phê hạt vùng Khe Sanh, hương vị trái cây mít, hậu vị chua dịu nhẹ.',
    descriptionEn: 'Beans from Khe Sanh, with a jackfruit note and a mild sour finish.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042309225978022/photo/menueditor_item_8b7ba76af0df444e9e16db2e9df981c9_1776936170798829229.webp',
    originVi: 'Khe Sanh, Quảng Trị',
    originEn: 'Khe Sanh, Quảng Trị',
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: ['Trái cây mít', 'Chua dịu nhẹ'],
    tastingNotesEn: ['Jackfruit', 'Mild acidity'],
    roastLevel: null,
    weightOptions: ['250g'],
    grindOptions: ['whole_bean'],
    priceVnd: 200_000,
    stock: 20,
    reorderLevel: 8,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
  {
    slug: 'bag-blend-70-30-250g',
    category: 'coffee' as const,
    nameVi: 'Túi 250g hạt cf 70% Robusta:30% Arabica',
    nameEn: '250g Bag · 70/30 Robusta-Arabica Blend',
    descriptionVi: 'Cà phê rang xay tại xưởng, phối trộn đậm đà và thơm nhẹ.',
    descriptionEn: 'Roasted in-house, blended for a bold cup with a lighter aroma.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025020307443591693/photo/menueditor_item_dcb6c2843a3d4eccba81f6e6468756f1_1738568525263197214.webp',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['250g'],
    grindOptions: ['whole_bean', 'phin'],
    priceVnd: 175_000,
    stock: 25,
    reorderLevel: 10,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
];

// Representative subset of the real "Homebaked Cake" + daily-special
// categories — croissant, cake, savory quiche, sandwich, bread. All handed
// off via GrabFood, matching how this data was sourced.
const BAKERY_ITEMS = [
  {
    slug: 'sunshine-croissant',
    nameVi: 'Sunshine Croissant - Croissant trứng muối',
    nameEn: 'Sunshine Croissant (Salted Egg)',
    descriptionVi: 'Bánh ngàn lớp, kem trứng muối béo ngậy, chà bông gà cay, trứng muối nghiền.',
    descriptionEn: 'Homemade croissant, creamy egg custard, chicken floss, salted egg yolk.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026081408082730232/photo/menueditor_item_c40624c0d1cf4f3a9adfc4a7ac4df827_1786694791583087924.webp',
    priceVnd: 75_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'carrot-cake',
    nameVi: 'Carrot cake - Bánh cà rốt',
    nameEn: 'Carrot Cake',
    descriptionVi: 'Bạt cà rốt quế siêu thơm, kem bơ phô mai thanh dịu, kẹo óc chó homemade.',
    descriptionEn: 'Cinnamon carrot sponge, light cream-cheese frosting, homemade candied walnut.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026012301510001009/photo/menueditor_item_ef15da2793c54e969f79c6e75781b9c6_1774939325143133788.webp',
    priceVnd: 75_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'ham-double-cheese-croissant',
    nameVi: 'Ham & Double cheese croissant',
    nameEn: 'Ham & Double Cheese Croissant',
    descriptionVi:
      'Bánh croissant thơm bơ, thịt dăm bông, phô mai cheddar, phô mai mozzarella, sốt mayo.',
    descriptionEn: 'Buttery croissant, ham, cheddar, mozzarella, mayo sauce.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026031702260881713/photo/menueditor_item_859c2f0a1b374329a515e3e7d520ab56_1774939247979353937.webp',
    priceVnd: 85_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'sesame-burnt-cheesecake-taro',
    nameVi: 'Sesame Burnt Cheesecake & Taro Cream',
    nameEn: 'Sesame Burnt Cheesecake & Taro Cream',
    descriptionVi: 'Bánh phô mai cháy vị mè đen, kem muối khoai môn, vụn cookie socola homemade.',
    descriptionEn:
      'Black-sesame burnt cheesecake, salted taro cream, homemade chocolate cookie crumb.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507423616054/photo/menueditor_item_6cfbaaeca27343cbab898888bf70e0c6_1786686202406515565.webp',
    priceVnd: 75_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'chi-chi-chicken-sando',
    nameVi: 'Chi-Chi Chicken Sando - Bánh mỳ kẹp gà giòn',
    nameEn: 'Chi-Chi Chicken Sando',
    descriptionVi: 'Bánh mỳ mềm, sốt belchame, xà lách, gà giòn, bơ, cà chua và muối tiêu.',
    descriptionEn:
      'Soft bread, belchame sauce, lettuce, crispy chicken, butter, tomato, salt and pepper.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026081308541843279/photo/menueditor_item_722cf498a14c4855b1e9541e70bcf4f5_1786611128660134339.webp',
    priceVnd: 69_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'mushroom-onion-quiche',
    nameVi: 'Mushroom and onion Quiche - Bánh mặn nấm và hành caramel',
    nameEn: 'Mushroom & Caramelised Onion Quiche',
    descriptionVi:
      'Đế bánh nướng cùng hành tây xào giấm balsamic và nấm hương sốt kem, sốt kem trứng royale.',
    descriptionEn: 'Tart shell, balsamic-caramelised onion, creamy mushroom, royale egg custard.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025021505162081614/photo/menueditor_item_484482e4cac94d5ca1a428037a9a103c_1774939425509646201.webp',
    priceVnd: 59_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'roasted-tomato-rosemary-focaccia',
    nameVi: 'Roasted tomato & rosemary focaccia - Bánh mỳ focaccia',
    nameEn: 'Roasted Tomato & Rosemary Focaccia',
    descriptionVi:
      'Bánh mỳ ủ chậm, dầu olive nguyên chất, cà chua bi nướng, tỏi confit, lá hương thảo.',
    descriptionEn:
      'Slow-proofed bread, extra virgin olive oil, roasted cherry tomato, confit garlic, rosemary.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072906493707068/photo/menueditor_item_c81c8fd1d14f4417bc6ab64908ec3190_1785307752124629130.webp',
    priceVnd: 55_000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
];

// Real café menu (prepared drinks) — display-only, dine-in. `section` is a
// locale-neutral key translated via message files, not editorial copy.
const MENU_ITEMS = [
  {
    slug: 'espresso',
    section: 'espresso',
    nameVi: 'Espresso',
    nameEn: 'Espresso',
    priceVnd: 50_000,
  },
  {
    slug: 'cappuccino',
    section: 'espresso',
    nameVi: 'Cappuccino',
    nameEn: 'Cappuccino',
    priceVnd: 60_000,
  },
  {
    slug: 'cafe-den',
    section: 'phin',
    nameVi: 'Cafe đen',
    nameEn: 'Black Phin Coffee',
    priceVnd: 39_000,
  },
  {
    slug: 'cafe-sua',
    section: 'phin',
    nameVi: 'Cafe sữa',
    nameEn: 'Milk Phin Coffee',
    priceVnd: 39_000,
  },
  {
    slug: 'coldbrew-truyen-thong',
    section: 'cold_brew',
    nameVi: 'Cold brew Truyền thống',
    nameEn: 'Classic Cold Brew',
    priceVnd: 55_000,
  },
  {
    slug: 'matcha-classic-latte',
    section: 'matcha',
    nameVi: 'Matcha Classic Latte',
    nameEn: 'Matcha Classic Latte',
    priceVnd: 55_000,
  },
  {
    slug: 'tra-thanh-long-nhan',
    section: 'tea',
    nameVi: 'Trà Thanh Long Nhãn - Mild',
    nameEn: 'Dragonfruit Longan Tea',
    priceVnd: 60_000,
  },
  {
    slug: 'cam-ep',
    section: 'juice',
    nameVi: 'Cam',
    nameEn: 'Fresh Orange Juice',
    priceVnd: 55_000,
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
    titleVi: 'Ưu đãi hôm nay: giảm giá bánh cookie',
    titleEn: "Today's offer: cookies discounted",
    bodyVi: 'Giảm 10% Original cookie và Pistachio cookie, áp dụng trên GrabFood.',
    bodyEn: '10% off Original and Pistachio cookies, on GrabFood.',
    startsAt: daysAgo(1),
    endsAt: daysFromNow(6),
    siteSlug: 'ly-tu-trong',
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
  // Retarget the row seeded under the old fictional slug to the real site,
  // rather than letting the new slug create a duplicate below.
  await prisma.site.updateMany({ where: { slug: 'ngo-quyen' }, data: { slug: 'ly-tu-trong' } });
  // Fictional coffee products and bakery items superseded by real data.
  await prisma.product.deleteMany({ where: { slug: { in: RETIRED_PRODUCT_SLUGS } } });
  await prisma.bakeryItem.deleteMany({ where: { slug: { in: RETIRED_BAKERY_SLUGS } } });
  await prisma.announcement.deleteMany({
    where: { titleEn: { in: RETIRED_ANNOUNCEMENT_TITLES_EN } },
  });

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

  const liveSiteId = sites.get('ly-tu-trong')!;
  for (const item of BAKERY_ITEMS) {
    await prisma.bakeryItem.upsert({
      where: { siteId_slug: { siteId: liveSiteId, slug: item.slug } },
      update: item,
      create: { ...item, siteId: liveSiteId },
    });
  }
  console.log(`bakery items: ${BAKERY_ITEMS.length}`);

  for (const item of MENU_ITEMS) {
    await prisma.menuItem.upsert({
      where: { siteId_slug: { siteId: liveSiteId, slug: item.slug } },
      update: item,
      create: { ...item, siteId: liveSiteId },
    });
  }
  console.log(`menu items: ${MENU_ITEMS.length}`);

  // Only the real, open site has a real "today's roast" — the fictional
  // second site is left unset rather than inventing which bag it would sell.
  await prisma.site.update({
    where: { slug: 'ly-tu-trong' },
    data: { todaysRoastProductId: products.get('bag-arabica-250g') },
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
