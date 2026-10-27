export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  origin: string | null;
  imageUrl: string;
  priceVnd: number;
  stock: number;
  reorderLevel: number;
  roastDate: string;
  featuredUntil: string;
  isActive: boolean;
}

export const isLowStock = (product: AdminProduct) =>
  product.isActive && product.stock <= product.reorderLevel;
