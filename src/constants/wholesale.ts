// Real business content from the company's own printed wholesale price
// sheet (BẢNG-BÁO-GIÁ-SỈ-2026) and retail price sheet (BẢNG-GIÁ-LẺ-2026).
// Informational only — no ordering flow or account backs this yet, see
// docs/BUILD-PLAN.md. Prices exclude VAT unless noted.

export interface WholesaleBean {
  slug: string;
  name: string;
  process: string;
  priceVnd: number;
}

export const CORE_LINE_BEANS: WholesaleBean[] = [
  { slug: 'robusta', name: '100% Robusta', process: 'Natural · S16-18', priceVnd: 240_000 },
  {
    slug: '8r2a',
    name: 'Blend 80% Robusta / 20% Arabica',
    process: 'Natural · S16-18',
    priceVnd: 250_000,
  },
  {
    slug: '7r3a',
    name: 'Blend 70% Robusta / 30% Arabica',
    process: 'Natural · S16-18',
    priceVnd: 260_000,
  },
  {
    slug: 'arabica',
    name: '100% Arabica (Cầu Đất)',
    process: 'Washed · S16-18',
    priceVnd: 425_000,
  },
  {
    slug: 'liberica',
    name: '100% Liberica (Khe Sanh)',
    process: 'Natural · S16-18',
    priceVnd: 495_000,
  },
];

export const SIGNATURE_LINE_BEANS: WholesaleBean[] = [
  { slug: 'robusta', name: '100% Robusta', process: 'Honey · S18', priceVnd: 285_000 },
  {
    slug: '8r2a',
    name: 'Blend 80% Robusta / 20% Arabica',
    process: 'Honey/Washed · S18',
    priceVnd: 295_000,
  },
  {
    slug: '7r3a',
    name: 'Blend 70% Robusta / 30% Arabica',
    process: 'Honey/Washed · S18',
    priceVnd: 310_000,
  },
  {
    slug: '5r5a',
    name: 'Blend 50% Robusta / 50% Arabica',
    process: 'Honey/Washed · S18',
    priceVnd: 360_000,
  },
  { slug: 'arabica', name: '100% Arabica', process: 'Washed · S18', priceVnd: 495_000 },
];

export interface WholesaleVolumeTier {
  volume: string;
  pricesVnd: Record<string, number>;
}

export const CORE_LINE_VOLUME_TIERS: WholesaleVolumeTier[] = [
  {
    volume: '5–30 kg/month',
    pricesVnd: { robusta: 240_000, '8r2a': 250_000, '7r3a': 260_000, arabica: 425_000 },
  },
  {
    volume: '31–100 kg/month',
    pricesVnd: { robusta: 230_000, '8r2a': 240_000, '7r3a': 250_000, arabica: 405_000 },
  },
  {
    volume: '101–200 kg/month',
    pricesVnd: { robusta: 225_000, '8r2a': 235_000, '7r3a': 245_000, arabica: 395_000 },
  },
  {
    volume: '> 200 kg/month',
    pricesVnd: { robusta: 220_000, '8r2a': 230_000, '7r3a': 240_000, arabica: 390_000 },
  },
];

export const SIGNATURE_LINE_VOLUME_TIERS: WholesaleVolumeTier[] = [
  {
    volume: '5–30 kg/month',
    pricesVnd: {
      robusta: 285_000,
      '8r2a': 295_000,
      '7r3a': 310_000,
      '5r5a': 360_000,
      arabica: 495_000,
    },
  },
  {
    volume: '31–100 kg/month',
    pricesVnd: {
      robusta: 275_000,
      '8r2a': 285_000,
      '7r3a': 300_000,
      '5r5a': 350_000,
      arabica: 455_000,
    },
  },
  {
    volume: '101–200 kg/month',
    pricesVnd: {
      robusta: 270_000,
      '8r2a': 280_000,
      '7r3a': 295_000,
      '5r5a': 345_000,
      arabica: 435_000,
    },
  },
  {
    volume: '> 200 kg/month',
    pricesVnd: {
      robusta: 260_000,
      '8r2a': 275_000,
      '7r3a': 290_000,
      '5r5a': 340_000,
      arabica: 415_000,
    },
  },
];

export const OEM_PRICING = [
  { range: '1 – 1,000 kg', pricePerKgVnd: 35_000 },
  { range: '> 1,000 kg', pricePerKgVnd: 30_000 },
];
