'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { PRODUCTS, type Product, type ProductCategory } from '@/constants/products';
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

type SortOrder = 'featured' | 'price-asc' | 'price-desc';

const sortProducts = (products: Product[], order: SortOrder) => {
  if (order === 'price-asc') return [...products].sort((a, b) => a.priceVnd - b.priceVnd);
  if (order === 'price-desc') return [...products].sort((a, b) => b.priceVnd - a.priceVnd);
  return products;
};

interface ShopBrowserProps {
  products?: Product[];
}

export const ShopBrowser = ({ products = PRODUCTS }: ShopBrowserProps) => {
  const t = useTranslations('Shop');
  const [categories, setCategories] = useState<Set<ProductCategory>>(new Set());
  const [sortOrder, setSortOrder] = useState<SortOrder>('featured');

  const categoryOptions: { value: ProductCategory; label: string }[] = [
    { value: 'coffee', label: t('categoryCoffee') },
    { value: 'gift', label: t('categoryGiftSets') },
  ];

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
        ? products
        : products.filter((product) => categories.has(product.category));
    return sortProducts(filtered, sortOrder);
  }, [categories, products, sortOrder]);

  return (
    <div className="grid gap-8 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {t('categoryLabel')}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {categoryOptions.map((option) => (
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
            {t('productsCount', { count: filteredProducts.length })}
          </p>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger aria-label={t('sortLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t('sortFeatured')}</SelectItem>
              <SelectItem value="price-asc">{t('sortPriceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('sortPriceDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">{t('noResults')}</p>
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
