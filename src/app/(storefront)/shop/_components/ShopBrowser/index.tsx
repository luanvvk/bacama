'use client';

import { useMemo, useState } from 'react';

import { PRODUCTS, type ProductCategory } from '@/constants/products';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { ProductCard } from '@/components/shop/ProductCard';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'coffee', label: 'Coffee' },
  { value: 'gift', label: 'Gift sets' },
];

type SortOrder = 'featured' | 'price-asc' | 'price-desc';

const sortProducts = (products: typeof PRODUCTS, order: SortOrder) => {
  if (order === 'price-asc') return [...products].sort((a, b) => a.priceVnd - b.priceVnd);
  if (order === 'price-desc') return [...products].sort((a, b) => b.priceVnd - a.priceVnd);
  return products;
};

export const ShopBrowser = () => {
  const [categories, setCategories] = useState<Set<ProductCategory>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured');

  const toggleCategory = (category: ProductCategory) =>
    setCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  const filteredProducts = useMemo(() => {
    const filtered =
      categories.size === 0
        ? PRODUCTS
        : PRODUCTS.filter((product) => categories.has(product.category));
    return sortProducts(filtered, sortOrder);
  }, [categories, sortOrder]);

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Category
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`category-${option.value}`}
                checked={categories.has(option.value)}
                onCheckedChange={() => toggleCategory(option.value)}
              />
              <Label htmlFor={`category-${option.value}`} className="text-sm font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {filteredProducts.length} products
          </p>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Most recently roasted</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No products match those filters.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
