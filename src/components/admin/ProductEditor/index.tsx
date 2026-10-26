'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledInput } from '@/components/form';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { toast } from '@/lib/toast';
import type { AdminProduct } from '@/services/catalog/admin-product';
import { patchProduct } from '@/services/catalog/patch-product';
import type { UpdateProductInput } from '@/services/catalog/update-product';

const buildSchema = (t: (key: string) => string) =>
  z.object({
    price: z.string().regex(/^\d+$/, t('wholeVnd')),
    stock: z.string().regex(/^\d+$/, t('wholeStock')),
    reorderLevel: z.string().regex(/^\d+$/, t('wholeReorder')),
    roastDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, t('invalidDate')),
    featuredUntil: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, t('invalidDate')),
  });

type ProductFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface ProductEditorProps {
  product: AdminProduct;
}

const toFormValues = (product: AdminProduct): ProductFormValues => ({
  price: String(product.priceVnd),
  stock: String(product.stock),
  reorderLevel: String(product.reorderLevel),
  roastDate: product.roastDate,
  featuredUntil: product.featuredUntil,
});

export const ProductEditor = ({ product }: ProductEditorProps) => {
  const t = useTranslations('Admin.editor');
  const [saved, setSaved] = useState(() => toFormValues(product));
  const [isActive, setIsActive] = useState(product.isActive);
  const { control, handleSubmit } = useForm<ProductFormValues>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: saved,
  });

  const save = async (changes: UpdateProductInput) => {
    if (await patchProduct(product.id, changes)) {
      toast.success(t('saved', { name: product.name }));
      return true;
    }
    toast.error(t('saveFailed', { name: product.name }));
    return false;
  };

  const onSubmit = async (values: ProductFormValues) => {
    const before = saved;
    const changes: UpdateProductInput = {};
    if (values.price !== before.price) changes.priceVnd = Number(values.price);
    if (values.stock !== before.stock) changes.stock = Number(values.stock);
    if (values.reorderLevel !== before.reorderLevel) {
      changes.reorderLevel = Number(values.reorderLevel);
    }
    if (values.roastDate !== before.roastDate) changes.roastDate = values.roastDate || null;
    if (values.featuredUntil !== before.featuredUntil) {
      changes.featuredUntil = values.featuredUntil || null;
    }

    if (Object.keys(changes).length === 0) {
      toast(t('noChanges'));
      return;
    }
    if (await save(changes)) setSaved(values);
  };

  const toggleListing = async () => {
    if (await save({ isActive: !isActive })) setIsActive(!isActive);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('basics')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">{t('name')}</p>
              <p className="font-medium">{product.name}</p>
            </div>
            {product.origin && (
              <div>
                <p className="text-muted-foreground">{t('origin')}</p>
                <p className="font-medium">{product.origin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('priceStock')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <ControlledInput
              control={control}
              name="price"
              label={t('price')}
              inputMode="numeric"
            />
            <ControlledInput
              control={control}
              name="stock"
              label={t('stock')}
              inputMode="numeric"
            />
            <ControlledInput
              control={control}
              name="reorderLevel"
              label={t('reorderLevel')}
              inputMode="numeric"
            />
            <ControlledInput
              control={control}
              name="roastDate"
              label={t('roastDate')}
              type="date"
            />
            <p className="text-muted-foreground text-xs sm:col-span-2">{t('roastDateHint')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('featured')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ControlledInput
              control={control}
              name="featuredUntil"
              label={t('featuredUntil')}
              type="date"
              className="max-w-56"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt=""
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
            <div>
              <p className="font-medium">{t('currentPhoto')}</p>
              <p className="text-muted-foreground mt-1 text-xs">{t('photoNote')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('listing')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('shop')}</span>
              <Badge variant={isActive ? 'success' : 'destructive'}>
                {isActive ? t('listed') : t('notListed')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('productUrl')}</span>
              <code>/product/{product.slug}</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 xl:col-span-2">
        <Button type="submit">{t('save')}</Button>
        <Button type="button" variant="outline" onClick={toggleListing}>
          {isActive ? t('pause') : t('resume')}
        </Button>
      </div>
    </form>
  );
};
