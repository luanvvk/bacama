import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { isLowStock, type AdminProduct } from '@/services/catalog/admin-product';

interface LowStockBannerProps {
  products: AdminProduct[];
}

export const LowStockBanner = async ({ products }: LowStockBannerProps) => {
  const low = products.filter(isLowStock);
  if (low.length === 0) return null;

  const t = await getTranslations('Admin.lowStock');
  const [first] = low;

  return (
    <div className="border-warning bg-warning/10 mb-6 flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
      <TriangleAlert className="text-warning size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-52 flex-1">
        {low.length === 1 ? (
          <>
            <b>{t('title', { name: first.name })}</b>{' '}
            <span className="text-muted-foreground">
              {t('detail', { stock: first.stock, level: first.reorderLevel })}
            </span>
          </>
        ) : (
          <>
            <b>{t('many', { count: low.length })}</b>{' '}
            <span className="text-muted-foreground">{t('manyDetail')}</span>
          </>
        )}
      </p>
      <Button asChild size="sm">
        <Link href="/admin/catalog">{t('update')}</Link>
      </Button>
    </div>
  );
};
