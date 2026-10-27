export type ProductCategory = 'coffee' | 'gift';
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
