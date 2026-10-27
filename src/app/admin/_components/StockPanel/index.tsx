'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isLowStock, type AdminProduct } from '@/services/catalog/admin-product';
import { patchProduct } from '@/services/catalog/patch-product';

interface StockPanelProps {
  products: AdminProduct[];
}

export const StockPanel = ({ products }: StockPanelProps) => {
  const t = useTranslations('Admin.stock');
  const items = products.filter((product) => product.isActive);
  const [saved, setSaved] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, item.stock])),
  );
  const [quantities, setQuantities] = useState(saved);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = async () => {
    const changed = items.filter((item) => quantities[item.id] !== saved[item.id]);
    if (changed.length === 0) {
      toast(t('noChanges'));
      return;
    }

    setIsSaving(true);
    const results = await Promise.all(
      changed.map(async (item) => ({
        id: item.id,
        ok: await patchProduct(item.id, { stock: quantities[item.id] }),
      })),
    );
    setIsSaving(false);

    setSaved((current) => ({
      ...current,
      ...Object.fromEntries(
        results.filter((result) => result.ok).map((result) => [result.id, quantities[result.id]]),
      ),
    }));
    if (results.every((result) => result.ok)) toast.success(t('saved'));
    else toast.error(t('saveFailed'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 && <p className="text-muted-foreground text-sm">{t('empty')}</p>}
        {items.map((item) => {
          const low = isLowStock({ ...item, stock: quantities[item.id] });
          return (
            <div key={item.id} className="flex items-center gap-3">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-10 shrink-0 rounded-sm object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p
                  className={cn(
                    'font-mono text-xs',
                    low ? 'text-warning' : 'text-muted-foreground',
                  )}
                >
                  {item.roastDate ? t('roasted', { date: item.roastDate }) : t('noRoast')}
                </p>
              </div>
              <Input
                type="number"
                min={0}
                aria-label={t('stockLabel', { name: item.name })}
                value={quantities[item.id]}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [item.id]: Number(event.target.value),
                  }))
                }
                className={cn('w-16 text-center', low && 'border-warning')}
              />
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={isSaving}
          onClick={onSave}
        >
          {t('save')}
        </Button>
        <p className="text-muted-foreground text-xs">{t('onlineOnly')}</p>
      </CardContent>
    </Card>
  );
};
