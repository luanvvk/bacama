import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Seed data sources, in order of trust:
//  1. Real data pulled from the live GrabFood listing (merchant ID
//     5-C3KEGFM1VGN2N2, "BACAMA COFFEE & MORE") — real address, hours, and
//     (as of this re-scrape) all 79 real, distinct menu items across the
//     listing's 11 categories: 7 packaged-coffee SKUs → Product, 48
//     Homebaked Cake items → BakeryItem. (92 was an earlier count; the live
//     menu has since changed — 79 is what's actually live now.) Vietnamese
//     copy here is the business's own, taken verbatim.
//  2. The business's own printed dine-in menu board (photographed front and
//     back) for MenuItem (prepared drinks) — its prices differ from
//     GrabFood's delivery prices for the same drinks, and the board is the
//     dine-in source of truth.
//  3. The business's own retail price list (BẢNG-GIÁ-LẺ-QUÁN-2026, Signature
//     Line) to reconcile the 4 whole-bean Product prices against GrabFood's,
//     where the two disagreed.
//  4. coffee-shop-ui.html's fictional multi-site roastery narrative, kept for
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

// Grab has no confirmed per-item deep-link format, so every "grabfood"
// handoff item points at the merchant listing itself (real, always works)
// rather than a guessed item-level URL.
const GRABFOOD_MERCHANT_URL =
  'https://food.grab.com/vn/vi/restaurant/bacama-coffee-more-delivery/5-C3KEGFM1VGN2N2';

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
// Slugs from the earlier drink subset that don't match a real item on the
// business's own dine-in menu board (or were renamed to match its wording).
const RETIRED_MENU_ITEM_SLUGS = ['matcha-classic-latte', 'tra-thanh-long-nhan'];
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

// Real packaged coffee (GrabFood category "Cà phê đóng gói", all 7 real
// SKUs as of this re-scrape). Sold by bean type, not by the fictional
// single-origin story it replaces. Prices for the 4 whole-bean bags are
// reconciled against the business's own retail price list
// (BẢNG-GIÁ-LẺ-QUÁN-2026, Signature Line, 250g column) rather than the
// GrabFood delivery price where the two disagree — the retail sheet is the
// business's own authoritative price, GrabFood's may include a delivery
// markup or simply be stale.
const PRODUCTS = [
  {
    slug: 'bag-arabica-250g',
    category: 'coffee' as const,
    nameVi: 'Túi 250g hạt cf 100% Arabica',
    nameEn: '250g Bag · 100% Arabica',
    descriptionVi:
      'Cà phê rang xay tại xưởng. Robusta thiên về vị đậm đắng & Arabica thiên về hương thơm dịu nhẹ và hậu vị chua dịu. Robusta phù hợp để pha phin và các món đồ uống Cà phê Việt Nam. Arabica phù hợp cho Cà phê Ý & Coldbrew.',
    descriptionEn:
      'Roasted in-house. Robusta leans bold and bitter; Arabica leans toward a gentle aroma with a mild sour finish. Robusta suits phin brewing and Vietnamese coffee drinks; Arabica suits Italian coffee and cold brew.',
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
    priceVnd: 185_000,
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
    descriptionVi:
      'Cà phê rang xay tại xưởng. Robusta thiên về vị đậm đắng & Arabica thiên về hương thơm dịu nhẹ và hậu vị chua dịu. Robusta phù hợp để pha phin và các món đồ uống Cà phê Việt Nam. Arabica phù hợp cho Cà phê Ý & Coldbrew.',
    descriptionEn:
      'Roasted in-house. Robusta leans bold and bitter; Arabica leans toward a gentle aroma with a mild sour finish. Robusta suits phin brewing and Vietnamese coffee drinks; Arabica suits Italian coffee and cold brew.',
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
    descriptionVi:
      'Cà phê hạt vùng Khe Sanh, hương vị trái cây mít, hậu vị chua dịu nhẹ, hợp cho cà phê Ý, coldbrew.',
    descriptionEn:
      'Beans from Khe Sanh, with a jackfruit note and a mild sour finish — good for Italian coffee and cold brew.',
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
    priceVnd: 185_000,
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
    descriptionVi:
      'Cà phê rang xay tại xưởng. Robusta thiên về vị đậm đắng & Arabica thiên về hương thơm dịu nhẹ và hậu vị chua dịu. Robusta phù hợp để pha phin và các món đồ uống Cà phê Việt Nam. Arabica phù hợp cho Cà phê Ý & Coldbrew.',
    descriptionEn:
      'Roasted in-house. Robusta leans bold and bitter; Arabica leans toward a gentle aroma with a mild sour finish. Robusta suits phin brewing and Vietnamese coffee drinks; Arabica suits Italian coffee and cold brew.',
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
  {
    slug: 'phin-drip-bag',
    category: 'coffee' as const,
    nameVi: 'Phin drip coffee bag',
    nameEn: 'Phin Drip Coffee Bag',
    descriptionVi: 'Cà phê túi phin drip, gu đậm đà, phù hợp pha drip, moka.',
    descriptionEn: 'Drip-bag coffee, bold profile — good for drip brewers or a moka pot.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042309044283507/photo/menueditor_item_4a7c640ab3fb492faa2b7d0b8150d31d_1779777886401741669.webp',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['drip bag'],
    grindOptions: ['drip'],
    priceVnd: 145_000,
    stock: 20,
    reorderLevel: 8,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
  {
    slug: 'coldbrew-filter-arabica',
    category: 'coffee' as const,
    nameVi: 'Coldbrew túi lọc Arabica',
    nameEn: 'Cold Brew Filter Bag · Arabica',
    descriptionVi: 'Cà phê túi lọc coldbrew, hương vị trái cây nhiều, chua dịu, nhẹ nhàng.',
    descriptionEn: 'Cold-brew filter bag, fruit-forward with a gentle, mild acidity.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042309030166376/photo/menueditor_item_28cf85dec4124a3b975370ac053b7963_1779777914305058822.webp',
    originVi: null,
    originEn: null,
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['filter bag'],
    grindOptions: ['cold_brew'],
    priceVnd: 175_000,
    stock: 15,
    reorderLevel: 6,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
  {
    slug: 'coldbrew-filter-liberica',
    category: 'coffee' as const,
    nameVi: 'Coldbrew túi lọc Liberica',
    nameEn: 'Cold Brew Filter Bag · Liberica',
    descriptionVi:
      'Cà phê túi lọc coldbrew, hương vị trái cây nhiều, chua dịu, hương mít nhẹ nhàng.',
    descriptionEn:
      'Cold-brew filter bag, fruit-forward with mild acidity and a light jackfruit note.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308545433936/photo/menueditor_item_e5e107ef191b4032a2ffa888f150990d_1779777935370177693.webp',
    originVi: 'Khe Sanh, Quảng Trị',
    originEn: 'Khe Sanh, Quảng Trị',
    originStoryVi: null,
    originStoryEn: null,
    tastingNotesVi: [],
    tastingNotesEn: [],
    roastLevel: null,
    weightOptions: ['filter bag'],
    grindOptions: ['cold_brew'],
    priceVnd: 155_000,
    stock: 15,
    reorderLevel: 6,
    roastDate: daysAgo(2),
    featuredUntil: null,
    brewGuides: [] as { method: string; ratio: string; detailVi: string; detailEn: string }[],
  },
];

// All 48 real items from the live GrabFood "Homebaked Cake" category —
// croissants, cakes, cheesecakes, savory quiches, sandwiches, breads, and
// salads (this category is the listing's catch-all for baked/prepared food,
// not just cake despite its name). All handed off via GrabFood, matching how
// this data was sourced.
const BAKERY_ITEMS = [
  {
    slug: 'sunshine-croissant',
    nameVi: 'Sunshine Croissant - Croissant trứng muối',
    nameEn: 'Sunshine Croissant (Salted Egg)',
    descriptionVi: 'Bánh ngàn lớp, kem trứng muối béo ngậy, chà bông gà cay, trứng muối nghiền.',
    descriptionEn: 'Homemade croissant, creamy egg custard, chicken floss, salted egg yolk.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026081408082730232/photo/menueditor_item_c40624c0d1cf4f3a9adfc4a7ac4df827_1786694791583087924.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'original-chocolate-cookie',
    nameVi: 'Original cookie - Bánh cookie socola',
    nameEn: 'Original Chocolate Cookie',
    descriptionVi: 'Bánh cookie socola nguyên bản.',
    descriptionEn: 'Original chocolate cookie.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072907191213859/photo/menueditor_item_1322a75ba59c4606b3d9cd6a9d6650f5_1785309535469788279.webp',
    priceVnd: 49000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'pistachio-cookie',
    nameVi: 'Pistachio cookie - Bánh cookie hạt dẻ cười',
    nameEn: 'Pistachio Cookie',
    descriptionVi: 'Bánh cookie vị hạt dẻ cười.',
    descriptionEn: 'Pistachio cookie.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072907164158073/photo/menueditor_item_db1f123dbcbc4a3fa55d5bf0ebe23aa2_1785309390576705254.webp',
    priceVnd: 49000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'dark-chocolate-blueberry-crumble-tart',
    nameVi: 'Dark chocolate & Blueberry Crumble Tart - Tart việt quốc và socola',
    nameEn: 'Dark Chocolate & Blueberry Crumble Tart',
    descriptionVi: 'Tart giòn nhân socola đen và việt quất, dạng crumble.',
    descriptionEn: 'Crumble tart with dark chocolate and blueberry.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072209363732223/photo/menueditor_item_e5b8da68f55449cba29c64b269cda9f4_1784712977107533810.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'sun-dried-tomato-chicken-quiche',
    nameVi: 'Sun-dried tomato & chicken quiche - Bánh mặn gà và cà chua sấy',
    nameEn: 'Sun-Dried Tomato & Chicken Quiche',
    descriptionVi:
      'Gà xào cùng tỏi confit, lá hương thảo và cà chua sấy, sốt kem trứng và vỏ tart thơm bơ.',
    descriptionEn:
      'Chicken sautéed with confit garlic, rosemary and sun-dried tomato, egg custard filling in a buttery tart shell.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072205582517965/photo/menueditor_item_e579d9b595a445cea6c6cedc058d15af_1784710300217330418.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'caramel-cornflake-croissant',
    nameVi: 'Caramel cornflake croissant',
    nameEn: 'Caramel Cornflake Croissant',
    descriptionVi:
      'Croissant bơ ngàn lớp nhân kem sữa béo mịn, dịu ngọt, phủ cornflake caramel giòn rụm.',
    descriptionEn:
      'Buttery laminated croissant filled with smooth milk cream, lightly sweet, topped with crunchy caramel cornflakes.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208123707998/photo/menueditor_item_6b5bb792d6884a67b1a7437c9ac6c8c7_1781251934001035570.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'garlic-cheese-croissant',
    nameVi: 'Croissant bơ tỏi phô mai - Garlic croissant',
    nameEn: 'Garlic Cheese Croissant',
    descriptionVi:
      'Croissant bơ tỏi phô mai. Giòn thơm, phủ sốt bơ tỏi đậm đà và nhân phô mai béo mịn tan chảy bên trong.',
    descriptionEn:
      'Garlic cheese croissant. Crisp and fragrant, coated in rich garlic butter sauce with a melting cheese filling inside.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208083743731/photo/menueditor_item_2ddc6eb7344b45939922fb7485cf17c8_1784710353494200996.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'plain-croissant',
    nameVi: 'Plain Croissant - Bánh croissant',
    nameEn: 'Plain Croissant',
    descriptionVi: 'Bánh croissant nguyên bản.',
    descriptionEn: 'Plain croissant.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052508551478875/photo/menueditor_item_cdea1a8920ba4f2d8f3a66e1c9ecd198_1779775184949263447.webp',
    priceVnd: 59000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'cheese-button-cookie',
    nameVi: 'Bánh hạt nút phô mai',
    nameEn: 'Cheese Button Cookie',
    descriptionVi: 'Bánh lưỡi mèo dạng nút, vị phô mai béo béo',
    descriptionEn: 'Button-shaped langue de chat cookie, rich cheese flavor.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052508335926219/photo/menueditor_item_47f8e2c452f54917baa0cdad56ff9ea3_1779698022788984651.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'sesame-burnt-cheesecake-taro',
    nameVi: 'Sesame Burnt Cheesecake & Taro Cream',
    nameEn: 'Sesame Burnt Cheesecake & Taro Cream',
    descriptionVi:
      'Bánh phô mai cháy vị mè đen siêu cuốn, kem muối khoai môn, vụn cookie socola homemade, kem mè đen.',
    descriptionEn:
      'Black sesame burnt cheesecake, salted taro cream, homemade chocolate cookie crumble, black sesame cream.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507423616054/photo/menueditor_item_6cfbaaeca27343cbab898888bf70e0c6_1786686202406515565.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'almond-button-cookie',
    nameVi: 'Bánh nút hạnh nhân',
    nameEn: 'Almond Button Cookie',
    descriptionVi: 'Bánh lưỡi mèo dạng nút, bột hạnh nhân và hạnh phân lát rang thơm',
    descriptionEn: 'Button-shaped langue de chat cookie, almond flour and toasted almond flakes.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308442551046/photo/menueditor_item_e4dc1eae13bb40b387960d3201976c89_1776933838785262416.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'mocha-button-cookie',
    nameVi: 'Bánh hạt nút mocha',
    nameEn: 'Mocha Button Cookie',
    descriptionVi: 'Bánh lưỡi mèo dạng nút, vị cacao và cafe Robusta 100%',
    descriptionEn: 'Button-shaped langue de chat cookie, cocoa and 100% Robusta coffee flavor.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308433944133/photo/menueditor_item_ffb009407d074b7481fa5641aa51ffbc_1776933773292734358.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'cheese-stick-cookie',
    nameVi: 'Bánh que phô mai',
    nameEn: 'Cheese Stick Cookie',
    descriptionVi: 'Bánh quy giòn, bột phô mai',
    descriptionEn: 'Crispy cookie stick, cheese powder.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308414748763/photo/menueditor_item_3aa2f9fb595f4fad960ecca6a8a2ad82_1776933631512376408.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'ham-double-cheese-croissant',
    nameVi: 'Ham & Double cheese croissant',
    nameEn: 'Ham & Double Cheese Croissant',
    descriptionVi:
      'Bánh croissant thơm bơ, thịt dăm bông, phô mai chedda, phô mai morazella, sốt mayo',
    descriptionEn: 'Buttery croissant, ham, cheddar cheese, mozzarella cheese, mayo sauce.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026031702260881713/photo/menueditor_item_859c2f0a1b374329a515e3e7d520ab56_1774939247979353937.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'chocolate-chip-brownie',
    nameVi: 'Chocolate Chip Brownie - Bánh brownie 2 vị socola',
    nameEn: 'Chocolate Chip Brownie',
    descriptionVi: 'Bạt bánh socola 65% ít ngọt, ẩm, đắng nhẹ, socola chip',
    descriptionEn:
      '65% dark chocolate brownie base, low sweetness, moist, lightly bitter, chocolate chips.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025032308265694034/photo/menueditor_item_b41e0a27cde04b5793fcd02927c74496_1774939369250002039.webp',
    priceVnd: 61000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'bacon-cherry-tomato-quiche',
    nameVi: 'Bacon and chery tomato Quiche - Bánh mặn Thịt XK và cà chua bi',
    nameEn: 'Bacon & Cherry Tomato Quiche',
    descriptionVi: 'Đế bánh mặn, sốt kem royale, thịt xông khói, cà chua bi',
    descriptionEn: 'Savory tart base, royale custard, bacon, cherry tomato.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025021505193618007/photo/menueditor_item_a345da31304248498620226f2ce05f72_1774939399807909473.webp',
    priceVnd: 59000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'mushroom-onion-quiche',
    nameVi: 'Mushroom and onion Quiche - Bánh mặn nấm và hành caramel',
    nameEn: 'Mushroom & Onion Quiche',
    descriptionVi:
      'Đế bánh nướng cùng với hành tây xào giấm balsamic và nấm hương sốt kem, sốt kem trứng royale',
    descriptionEn:
      'Baked tart base with onion sautéed in balsamic vinegar and creamy shiitake mushroom, royale egg custard.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025021505162081614/photo/menueditor_item_484482e4cac94d5ca1a428037a9a103c_1774939425509646201.webp',
    priceVnd: 59000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'chi-chi-chicken-sando',
    nameVi: 'Chi-Chi Chicken Sando - Bánh mỳ kẹp gà giòn',
    nameEn: 'Chi-Chi Chicken Sando',
    descriptionVi: 'Bánh mỳ mềm, sốt belchame, xà lách, gà giòn, bơ, cà chua và muối tiêu',
    descriptionEn:
      'Soft bread dough, belchame sauce, lettuce, chicken popcorn, butter, tomato, salt and pepper.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026081308541843279/photo/menueditor_item_722cf498a14c4855b1e9541e70bcf4f5_1786611128660134339.webp',
    priceVnd: 69000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'sausage-cheese-bread',
    nameVi: 'Sausage & cheese Bread - Bánh mỳ xúc xích',
    nameEn: 'Sausage & Cheese Bread',
    descriptionVi: 'Bánh mỳ nhân xúc xích và phô mai.',
    descriptionEn: 'Bread with sausage and cheese filling.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026080101135054039/photo/menueditor_item_c9b9a6014cec40a8bb643bee8a47a15a_1785547131167368755.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'orange-earl-grey-cookie',
    nameVi: 'Orange-Earl grey Cookies',
    nameEn: 'Orange Earl Grey Cookie',
    descriptionVi: 'Bánh cookie vị cam và trà bá tước.',
    descriptionEn: 'Orange and Earl Grey tea cookie.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072907115809011/photo/menueditor_item_d14ff6861bcc4cbf821f2f2247f04c9f_1785309109703590118.webp',
    priceVnd: 49000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'roasted-tomato-rosemary-focaccia',
    nameVi: 'Roasted tomato & rosemary focaccia - Bánh mỳ focaccia',
    nameEn: 'Roasted Tomato & Rosemary Focaccia',
    descriptionVi:
      'Bánh mỳ ủ chậm, dầu olive nguyên chất, cà chua bi nướng, tỏi confit, lá hương thảo',
    descriptionEn:
      'Slow-fermented bread, extra virgin olive oil, roasted cherry tomato, confit garlic, rosemary.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072906493707068/photo/menueditor_item_c81c8fd1d14f4417bc6ab64908ec3190_1785307752124629130.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'earl-grey-orange-bread',
    nameVi: 'Earl Grey & Orange Bread - Bánh Mỳ Cam, Trà Bá Tước',
    nameEn: 'Earl Grey & Orange Bread',
    descriptionVi: 'Bánh mỳ vị cam và trà bá tước.',
    descriptionEn: 'Orange and Earl Grey tea bread.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072408402154051/photo/menueditor_item_a5602f6dbcef4b0a9f83533f2c01f60c_1784882369886859425.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'secret-garden-burnt-cheesecake',
    nameVi: 'Secret Garden Burnt Cheesecake - Bánh phô mai cháy kem phô mai',
    nameEn: 'Secret Garden Burnt Cheesecake',
    descriptionVi:
      'Bánh phô mai cháy mềm mịn với lớp kem phô mai bồng bềnh, điểm xuyết vụn cookie homemade giòn thơm và hoa viola xinh tươi',
    descriptionEn:
      'Smooth and soft burnt cheesecake with a fluffy cream cheese topping, crunchy homemade cookie crumble, and pretty viola flowers.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072202412269984/photo/menueditor_item_7b9881ae479a45f683eb1a3e8180d448_1784687692210969021.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'ciabatta-sandwich',
    nameVi: 'Ciabatta Sandwich - Bánh mỳ ciabata kẹp thịt',
    nameEn: 'Ciabatta Sandwich',
    descriptionVi:
      'Bánh ciabatta ủ chậm, xà lách thuỷ tinh, hành rim caramel, cheddar cheese, cà chua tươi, thịt dăm bông vai, sốt phô mai cay nhẹ.',
    descriptionEn:
      'Slow-fermented ciabatta, butterhead lettuce, caramelized onion, cheddar cheese, fresh tomato, shoulder ham, mildly spicy cheese sauce.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026072103393967557/photo/menueditor_item_c63c4df0575c4c7ebb1c7f9bcd47a746_1784605025320822383.webp',
    priceVnd: 135000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'bacon-egg-soft-bread',
    nameVi: 'Bacon and Egg Soft Bread',
    nameEn: 'Bacon & Egg Soft Bread',
    descriptionVi: 'Bánh mỳ mềm nhân thịt xông khói và trứng.',
    descriptionEn: 'Soft bread with bacon and egg filling.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026071800490382424/photo/menueditor_item_9c3592dc8aaf4790afa109e4b333aafb_1784690268129091533.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'chicken-cheesy-bread',
    nameVi: 'Chicken Cheesy Bread',
    nameEn: 'Chicken Cheesy Bread',
    descriptionVi: 'Bánh mỳ nhân gà và phô mai.',
    descriptionEn: 'Bread with chicken and cheese filling.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026071800385492734/photo/menueditor_item_eb20be22fb0f4f1dbb4362b0c332201e_1784517047866614340.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'blueberry-cream-cheese-bread',
    nameVi: 'Blueberry Cream Cheese Bread',
    nameEn: 'Blueberry Cream Cheese Bread',
    descriptionVi: 'Bánh mỳ ngọt, nhân phô mai cream cheese, sốt việt quốc, vụn cookie homemade.',
    descriptionEn: 'Sweet bread, cream cheese filling, blueberry sauce, homemade cookie crumble.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026071306111883875/photo/menueditor_item_490e7786d39140109dbe1aea66a81869_1783922716778387411.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'focaccia-egg-salad',
    nameVi: 'Foccacia and Egg Salad',
    nameEn: 'Focaccia & Egg Salad',
    descriptionVi:
      'Bánh mỳ foccacia với men poolish ủ lạnh - sử dụng dầu olive nguyên chất kèm cà chua bi. Thêm salad (xà lách thuỷ tinh, cà rốt, cà chua bi, bắp mỹ, bắp cải tím) với trứng và sốt mè rang. Rất thích hợp cho bữa trưa đủ chất nhưng không nặng bụng.',
    descriptionEn:
      'Focaccia made with cold-fermented poolish, extra virgin olive oil and cherry tomato. Served with salad (butterhead lettuce, carrot, cherry tomato, sweet corn, purple cabbage), egg, and toasted sesame dressing. A well-balanced, light lunch option.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026070606535723584/photo/menueditor_item_c9b26e8af4a245f6a0a7280b6b900a86_1783320604143906423.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'mocha-dark-chocolate-burnt-cheesecake',
    nameVi: 'Mocha & dark choco burnt cheesecake - Bánh phô mai cháy cafe Robusta',
    nameEn: 'Mocha & Dark Chocolate Burnt Cheesecake',
    descriptionVi:
      'Bánh phô mai cháy đậm vị cafe Robusta và socola nguyên chất 65%, kem mascarpone mát dịu cùng socola thanh deco',
    descriptionEn:
      'Burnt cheesecake with bold Robusta coffee and 65% pure dark chocolate, cool mascarpone cream, chocolate bar garnish.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061903134944873/photo/menueditor_item_acf6ed4491824b538cd4b6ad69ff0292_1782271670902874574.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'cinnamon-bread',
    nameVi: 'Bánh mì quế - Cinnamon bread',
    nameEn: 'Cinnamon Bread',
    descriptionVi: 'Bánh mì mềm thơm bơ sữa, phủ đường quế nướng nhẹ, đơn giản nhưng đầy cuốn hút',
    descriptionEn:
      'Soft bread with a buttery milk aroma, topped with lightly baked cinnamon sugar, simple yet irresistible.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208252158999/photo/menueditor_item_292a69b4b4074ceaa82ef6d57ba40675_1781252672104323145.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'papparoti',
    nameVi: 'Papparoti',
    nameEn: 'Papparoti',
    descriptionVi:
      'Lớp vỏ vàng nâu giòn nhẹ, thơm bơ caramel quyện mùi cà phê rang đặc trưng kết hợp nhân socola đậm đà.',
    descriptionEn:
      'Light, golden-brown crust with a buttery caramel aroma and signature roasted coffee scent, filled with rich chocolate.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208212202306/photo/menueditor_item_78cb2bcfb2404c289088b2a3945213f6_1781252429199538668.webp',
    priceVnd: 55000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'plum-forest',
    nameVi: 'Plum forest',
    nameEn: 'Plum Forest',
    descriptionVi:
      'Bạt bánh chocolate mềm ẩm, kem mascarpone béo thanh và mứt mận Bắc nhà làm chua ngọt tự nhiên',
    descriptionEn:
      'Moist chocolate sponge, light mascarpone cream, and naturally sweet-tart homemade Northern plum jam.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208174534718/photo/menueditor_item_be04f870d6314bcc974c900b48643618_1782271622341088099.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'almond-cream-plum-jam-croissant',
    nameVi: 'Croissant Kem Hạnh Nhân & Mứt Mận Bắc Nhà Làm',
    nameEn: 'Almond Cream Croissant with Homemade Plum Jam',
    descriptionVi:
      'Croissant bơ ngàn lớp nhân kem hạnh nhân, kết hợp mứt mận Bắc tự sên chua ngọt đậm đà',
    descriptionEn:
      'Buttery laminated croissant filled with almond cream, paired with homemade sweet-tart Northern plum jam.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026061208162852100/photo/menueditor_item_4cfa659bd45d424db771e8dd1ec642a1_1781252159851035156.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'pain-au-chocolat',
    nameVi: 'Pain au chocolate',
    nameEn: 'Pain au Chocolat',
    descriptionVi: 'Bánh pain au chocolate nhân socola.',
    descriptionEn: 'Pain au chocolat with chocolate filling.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052508554897870/photo/menueditor_item_23c6a2cf894e46f0b2e24fb68d413a1f_1779775087062425074.webp',
    priceVnd: 61000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'mango-summer-tart',
    nameVi: 'Mango Summer Tart',
    nameEn: 'Mango Summer Tart',
    descriptionVi:
      'Đế tart ngọt thơm hạnh nhân, frangipage hạnh nhân bùi béo, sốt kem trứng mềm mịn, bạt bánh trà bá tước thơm, kem phô mai thanh mát, mứt xoài và xoài keo tươi chua ngọt',
    descriptionEn:
      'Sweet almond tart shell, rich almond frangipane, smooth egg custard, fragrant Earl Grey sponge, light cream cheese, mango jam and fresh sweet-tart keo mango.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507573904416/photo/menueditor_item_7a36bf3ed04c417ab0977b116f5464fc_1779697072878228352.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'oreo-burnt-cheesecake',
    nameVi: 'Oreo burnt cheesecake',
    nameEn: 'Oreo Burnt Cheesecake',
    descriptionVi: 'Bánh phô mai vụn oreo tuổi thơ',
    descriptionEn: 'Burnt cheesecake with nostalgic Oreo cookie crumble.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507505877589/photo/menueditor_item_14dbc655a6484fb5be5fc622c20bfdab_1779697144898626756.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'orange-earl-grey-burnt-cheesecake',
    nameVi: 'Orange & Earl grey  burnt cheesecake',
    nameEn: 'Orange & Earl Grey Burnt Cheesecake',
    descriptionVi: 'Bánh phô mai cháy đậm vị trà bá tước, mứt cam vàng chua chua ngọt ngọt',
    descriptionEn:
      'Burnt cheesecake with bold Earl Grey tea flavor, sweet-tart golden orange marmalade.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507470558114/photo/menueditor_item_9c592ca1febb41bcb6be5debd32aa3bf_1779697172249626466.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'original-burnt-cheesecake',
    nameVi: 'Original Burnt Cheesecake',
    nameEn: 'Original Burnt Cheesecake',
    descriptionVi: 'Bánh phô mai cháy mềm mịn',
    descriptionEn: 'Soft and smooth burnt cheesecake.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026052507410212915/photo/menueditor_item_329e53246aef4232a58cc6f5f55e843e_1779697228226152012.webp',
    priceVnd: 70000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'pineapple-cookie',
    nameVi: 'Bánh quy dứa',
    nameEn: 'Pineapple Cookie',
    descriptionVi: 'Vỏ bánh phô mai thơm bơ, nhân dứa ít ngọt',
    descriptionEn: 'Buttery cheese cookie crust, lightly sweet pineapple filling.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308423011960/photo/menueditor_item_8817fa6a474948d3a055f939e3cadcf3_1776933725590831519.webp',
    priceVnd: 91000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'almond-banana-croissant',
    nameVi: 'Almond banana croissant',
    nameEn: 'Almond Banana Croissant',
    descriptionVi: 'Croissant socola, kem chuối hạnh nhân, chuối nướng, hạnh nhân lát',
    descriptionEn: 'Chocolate croissant, almond banana cream, roasted banana, almond flakes.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308401163519/photo/menueditor_item_94d0dbb31edb42829b8e5f3c3c2212b7_1776933577588189334.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'bacon-cheesant',
    nameVi: 'Bacon cheesant',
    nameEn: 'Bacon Cheesant',
    descriptionVi:
      'Bánh croissant thơm bơ, sốt trứng mayo homemade, thịt xông khói áp chảo, phô mai chedda.',
    descriptionEn: 'Buttery croissant, homemade egg mayo sauce, pan-seared bacon, cheddar cheese.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026042308390127584/photo/menueditor_item_f60338add8f741d0af21bdcaca90c7a7_1776933384163422286.webp',
    priceVnd: 89000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'spicy-egg-croissant',
    nameVi: 'Spicy egg croissant',
    nameEn: 'Spicy Egg Croissant',
    descriptionVi:
      'Bánh croissant thơm bơ, xà lách thuỷ tinh, hành tây caramel, trứng gà, sốt phô mai cay',
    descriptionEn:
      'Buttery croissant, butterhead lettuce, caramelized onion, egg, spicy cheese sauce.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026031702285712861/photo/menueditor_item_93b0e7c882dd447084d565b44e4e938e_1774939220206008849.webp',
    priceVnd: 85000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'popcorn-chicken-salad',
    nameVi: 'Popcorn chicken salad',
    nameEn: 'Popcorn Chicken Salad',
    descriptionVi:
      'Xà lách iceberg, bắp mỹ giòn, bắp cải tím, cà chua bi, gà popcorn + sốt phô mai cay, trứng + sốt mè rang',
    descriptionEn:
      'Iceberg lettuce, crisp sweet corn, purple cabbage, cherry tomato, popcorn chicken with spicy cheese sauce, egg with toasted sesame dressing.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026031702245091421/photo/menueditor_item_aae9ca4a9a9044cd8e05956068210a93_1774939272900493478.webp',
    priceVnd: 73000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'egg-mixed-salad',
    nameVi: 'Egg mixed salad',
    nameEn: 'Egg Mixed Salad',
    descriptionVi:
      'Xà lách iceberg, bắp mỹ giòn, bắp cải tím, cà chua bi, gà popcorn + sốt phô mai cay, trứng + sốt mè rang',
    descriptionEn:
      'Iceberg lettuce, crisp sweet corn, purple cabbage, cherry tomato, popcorn chicken with spicy cheese sauce, egg with toasted sesame dressing.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2026031702082795393/photo/menueditor_item_fb22b48beb5340d3a5d003e5d12814d4_1774939299492474674.webp',
    priceVnd: 73000,
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
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'tuna-sweet-corn-quiche',
    nameVi: 'Tuna Sweet Corn Quiche',
    nameEn: 'Tuna Sweet Corn Quiche',
    descriptionVi: 'Đế bánh mặn, sốt kem royale, cá ngừ ngâm dầu, bắp Mỹ giòn',
    descriptionEn: 'Savory tart base, royale custard, oil-packed tuna, crisp sweet corn.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025032308251364504/photo/menueditor_item_715fde890e0e41eba2448581e82f4675_1778210540999382679.webp',
    priceVnd: 59000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'lemon-cheesecake-tart',
    nameVi: 'Lemon Cheesecake Tart - Bánh phô mai chanh',
    nameEn: 'Lemon Cheesecake Tart',
    descriptionVi:
      'Đế tart ngọt thơm hạnh nhân, kem phô mai chanh thanh mát, sốt chanh xanh bùng vị',
    descriptionEn: 'Sweet almond tart shell, refreshing lemon cream cheese, zesty lime sauce.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025021505253953049/photo/menueditor_item_6dd150124e0543bca6f9e307a67443d0_1785905398399977089.webp',
    priceVnd: 65000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
  {
    slug: 'matcha-burnt-cheesecake',
    nameVi: 'Matcha Burnt Cheesecake',
    nameEn: 'Matcha Burnt Cheesecake',
    descriptionVi: 'Bánh phô mai cháy vị trà xanh Uji mát dịu, kem matcha và socola deco',
    descriptionEn:
      'Burnt cheesecake with cool Uji green tea flavor, matcha cream and chocolate garnish.',
    imageUrl:
      'https://huawei-food-cms.grab.com/compressed_webp/items/VNITE2025021505081149740/photo/menueditor_item_f3081bd4105248e5b7c342ac1c3b0e20_1779696994569306035.webp',
    priceVnd: 75000,
    bakesAt: 'Hằng ngày',
    sellOutBy: null,
    handoff: 'grabfood' as const,
  },
];

// Real café menu (prepared drinks) — display-only, dine-in. Sourced from the
// business's own printed menu board (photographed front/back), not GrabFood —
// GrabFood's drink prices are delivery prices and run higher than the dine-in
// board for the same drinks, so the board is the authoritative source here.
// `section` is a locale-neutral key translated via message files, not
// editorial copy.
const MENU_ITEMS = [
  // Vietnamese
  {
    slug: 'cafe-den',
    section: 'phin',
    nameVi: 'Cà phê đen',
    nameEn: 'Black Coffee',
    priceVnd: 34_000,
  },
  {
    slug: 'cafe-sua',
    section: 'phin',
    nameVi: 'Cà phê sữa',
    nameEn: 'Milk Coffee',
    priceVnd: 34_000,
  },
  {
    slug: 'bac-xiu',
    section: 'phin',
    nameVi: 'Bạc xỉu',
    nameEn: 'Bạc Xỉu Coffee',
    priceVnd: 45_000,
  },
  {
    slug: 'cafe-muoi',
    section: 'phin',
    nameVi: 'Cà phê muối',
    nameEn: 'Sea Salt Coffee',
    priceVnd: 45_000,
  },
  // Espresso
  {
    slug: 'espresso',
    section: 'espresso',
    nameVi: 'Espresso',
    nameEn: 'Espresso',
    priceVnd: 45_000,
  },
  {
    slug: 'americano',
    section: 'espresso',
    nameVi: 'Americano',
    nameEn: 'Americano',
    priceVnd: 50_000,
  },
  {
    slug: 'cappuccino',
    section: 'espresso',
    nameVi: 'Cappuccino',
    nameEn: 'Cappuccino',
    priceVnd: 55_000,
  },
  { slug: 'latte', section: 'espresso', nameVi: 'Latte', nameEn: 'Latte', priceVnd: 55_000 },
  {
    slug: 'flat-white',
    section: 'espresso',
    nameVi: 'Flat White',
    nameEn: 'Flat White',
    priceVnd: 55_000,
  },
  // Hand brew
  {
    slug: 'vietnamese-phin',
    section: 'hand_brew',
    nameVi: 'Vietnamese Phin',
    nameEn: 'Vietnamese Phin (Black / Milk Coffee)',
    priceVnd: 55_000,
  },
  { slug: 'v60', section: 'hand_brew', nameVi: 'V60', nameEn: 'V60', priceVnd: 65_000 },
  // Signature cold brew
  {
    slug: 'coldbrew-truyen-thong',
    section: 'cold_brew',
    nameVi: 'Truyền Thống',
    nameEn: 'Truyền Thống (Cold Brew)',
    priceVnd: 50_000,
  },
  {
    slug: 'coldbrew-doc-lap',
    section: 'cold_brew',
    nameVi: 'Độc Lập',
    nameEn: 'Độc Lập – Independence (Cold Brew, Honey, Salt)',
    priceVnd: 50_000,
  },
  {
    slug: 'coldbrew-tu-do',
    section: 'cold_brew',
    nameVi: 'Tự Do',
    nameEn: 'Tự Do – Freedom (Cold Brew, Lime, Sugar)',
    priceVnd: 50_000,
  },
  {
    slug: 'coldbrew-hanh-phuc',
    section: 'cold_brew',
    nameVi: 'Hạnh Phúc',
    nameEn: 'Hạnh Phúc – Happiness (Cold Brew, Orange, Cinnamon)',
    priceVnd: 50_000,
  },
  // Trà - Tea
  {
    slug: 'tra-huong',
    section: 'tea',
    nameVi: 'Hương',
    nameEn: 'Hương – Natural (Jasmine, Artichoke, Lime, Peach Syrup)',
    priceVnd: 55_000,
  },
  {
    slug: 'tra-moc',
    section: 'tea',
    nameVi: 'Mộc',
    nameEn: 'Mộc – Herbal (Jasmine, Orange, Cinnamon, Honey)',
    priceVnd: 55_000,
  },
  {
    slug: 'tra-thanh',
    section: 'tea',
    nameVi: 'Thanh',
    nameEn: 'Thanh – Mild (Jasmine, Honey, Longan, Aloe Vera)',
    priceVnd: 55_000,
  },
  {
    slug: 'tra-hong',
    section: 'tea',
    nameVi: 'Hồng',
    nameEn: 'Hồng – Pink (Jasmine, Aloe Vera, Pomegranate)',
    priceVnd: 55_000,
  },
  // Japanese matcha
  {
    slug: 'matcha-classic',
    section: 'matcha',
    nameVi: 'Classic Matcha',
    nameEn: 'Classic Matcha (Uji, Fresh Milk, Condensed Milk)',
    priceVnd: 50_000,
  },
  {
    slug: 'matcha-macchiato',
    section: 'matcha',
    nameVi: 'Matcha Macchiato',
    nameEn: 'Matcha Macchiato (Uji, Fresh Milk, Condensed Milk, Cream)',
    priceVnd: 60_000,
  },
  {
    slug: 'matcha-oat-milk',
    section: 'matcha',
    nameVi: 'Oat Milk Matcha',
    nameEn: 'Oat Milk Matcha (Uji, Oat Milk, Condensed Milk)',
    priceVnd: 65_000,
  },
  // Chocolate
  {
    slug: 'chocolate-classic',
    section: 'chocolate',
    nameVi: 'Classic Chocolate',
    nameEn: 'Classic Chocolate (Chocolate, Fresh Milk, Condensed Milk)',
    priceVnd: 50_000,
  },
  {
    slug: 'choco-creme-brulee',
    section: 'chocolate',
    nameVi: 'Choco Crème Brulee',
    nameEn: 'Choco Crème Brûlée (Chocolate, Fresh Milk, Condensed Milk, Egg Cream)',
    priceVnd: 55_000,
  },
  // Refresher
  {
    slug: 'cam-ep',
    section: 'juice',
    nameVi: 'Cam',
    nameEn: 'Fresh Orange Juice',
    priceVnd: 50_000,
  },
  {
    slug: 'chanh-atiso',
    section: 'juice',
    nameVi: 'Chanh Atiso',
    nameEn: 'Lime Artichoke Refresher',
    priceVnd: 50_000,
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
  await prisma.menuItem.deleteMany({ where: { slug: { in: RETIRED_MENU_ITEM_SLUGS } } });
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
    const data = {
      ...item,
      handoffUrl: item.handoff === 'grabfood' ? GRABFOOD_MERCHANT_URL : null,
    };
    await prisma.bakeryItem.upsert({
      where: { siteId_slug: { siteId: liveSiteId, slug: item.slug } },
      update: data,
      create: { ...data, siteId: liveSiteId },
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
