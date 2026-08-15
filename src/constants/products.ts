export type ProductCategory = 'coffee' | 'bakery' | 'gift';
export type RoastLevel = 'light' | 'medium' | 'dark';

export interface BrewGuide {
  method: string;
  ratio: string;
  detail: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  roastLevel?: RoastLevel;
  origin?: string;
  priceVnd: number;
  description: string;
  imageUrl: string;
  images?: string[];
  freshness: string;
  freshnessLow?: boolean;
  soldOut?: boolean;
  swatches?: string[];
  tastingNotes?: string[];
  weightOptions?: string[];
  grindOptions?: { label: string; disabled?: boolean }[];
  brewGuide?: BrewGuide[];
  originStory?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'dalat-washed',
    slug: 'dalat-washed',
    name: 'Đà Lạt Washed',
    category: 'coffee',
    roastLevel: 'medium',
    origin: 'Đà Lạt, Lâm Đồng · 1,500 m · Washed',
    priceVnd: 280000,
    description:
      'Clean and sweet. Roasted medium to keep the dried plum and honey, with a light mint finish as it cools.',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=620&q=72',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=74',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=160&q=70',
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=160&q=70',
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=160&q=70',
    ],
    freshness: 'Roasted 3 days ago',
    swatches: ['250g', '1kg', 'Phin', 'Espresso'],
    tastingNotes: ['Dried plum', 'Honey', 'Mint', 'Medium roast'],
    weightOptions: ['250 g', '500 g', '1 kg'],
    grindOptions: [
      { label: 'Whole bean' },
      { label: 'Phin' },
      { label: 'Espresso' },
      { label: 'Pour-over' },
      { label: 'Cold brew', disabled: true },
    ],
    brewGuide: [
      { method: 'Phin', ratio: '25 g · 120 ml', detail: 'Medium-coarse · 4–5 min' },
      { method: 'Espresso', ratio: '18 g → 36 g', detail: '26–30 s · 93 °C' },
      { method: 'Pour-over', ratio: '15 g · 250 ml', detail: 'Medium grind · 2:45' },
      { method: 'Cold brew', ratio: '70 g · 1 L', detail: '16 hours, cold' },
    ],
    originStory:
      'From three smallholder plots around Cầu Đất at 1,450–1,600 m. Washed, then dried under greenhouse for 14 days. We have bought direct from these farms since 2019.',
  },
  {
    id: 'sonla-natural',
    slug: 'son-la-natural',
    name: 'Sơn La Natural',
    category: 'coffee',
    roastLevel: 'dark',
    priceVnd: 265000,
    description: 'Cocoa, malt, a long sweet finish.',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=620&q=72',
    freshness: 'Roasted yesterday',
    swatches: ['250g', '1kg', 'Phin'],
  },
  {
    id: 'house-blend',
    slug: 'house-blend',
    name: 'House Blend',
    category: 'coffee',
    roastLevel: 'medium',
    priceVnd: 230000,
    description: 'Đà Lạt + Sơn La. Good in a phin and in espresso.',
    imageUrl:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=620&q=72',
    freshness: 'Roasted 2 days ago',
    swatches: ['250g', '1kg'],
  },
  {
    id: 'croissant-amandes',
    slug: 'croissant-aux-amandes',
    name: 'Croissant aux amandes',
    category: 'bakery',
    priceVnd: 45000,
    description: 'Out at 05:00. In-store or GrabFood only.',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=620&q=72',
    freshness: 'Back tomorrow',
    freshnessLow: true,
    soldOut: true,
  },
  {
    id: 'kouign-amann',
    slug: 'kouign-amann',
    name: 'Kouign-amann',
    category: 'bakery',
    priceVnd: 52000,
    description: 'French butter, crisp caramel, lightly salted.',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=620&q=72',
    freshness: 'Out at 05:20 · 12 left',
  },
  {
    id: 'three-origins-box',
    slug: 'three-origins-box',
    name: 'Three Origins Box',
    category: 'gift',
    priceVnd: 720000,
    description: 'Three 250 g bags with a roast-date card.',
    imageUrl:
      'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=620&q=72',
    freshness: 'Packed to order',
    swatches: ['3 × 250g'],
  },
];

export const getProductBySlug = (slug: string) => PRODUCTS.find((product) => product.slug === slug);
