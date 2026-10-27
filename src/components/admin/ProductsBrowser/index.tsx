'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatVnd } from '@/lib/format-price';
import { isLowStock, type AdminProduct } from '@/services/catalog/admin-product';

interface ProductsBrowserProps {
  products: AdminProduct[];
}

type StatusFilter = 'all' | 'live' | 'low';

const isLive = (product: AdminProduct) => product.isActive && product.stock > 0;

export const ProductsBrowser = ({ products }: ProductsBrowserProps) => {
  const t = useTranslations('Admin.catalog');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const live = products.filter(isLive);
  const low = live.filter(isLowStock);
  const visible = products.filter((product) => {
    const matchesQuery = `${product.name} ${product.origin ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus =
      status === 'all' ||
      (status === 'live' ? isLive(product) : isLive(product) && isLowStock(product));
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">{t('eyebrow')}</p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{t('description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled>
            {t('importCsv')}
          </Button>
          <Button disabled>+ {t('newProduct')}</Button>
          <span className="text-muted-foreground text-xs">{t('notAvailable')}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">{t('liveLabel')}</p>
            <p className="font-heading mt-2 text-2xl">{live.length}</p>
            <p className="text-muted-foreground text-xs">{t('listedProducts')}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">{t('totalStock')}</p>
            <p className="font-heading mt-2 text-2xl">
              {products.reduce((total, product) => total + product.stock, 0)}
            </p>
            <p className="text-muted-foreground text-xs">{t('unitsInStock')}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">{t('runningLow')}</p>
            <p className="font-heading mt-2 text-2xl">{low.length}</p>
            <p className="text-muted-foreground text-xs">{t('needsAttention')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchLabel')}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border p-1" aria-label={t('filterLabel')}>
              {(['all', 'live', 'low'] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={status === value ? 'secondary' : 'ghost'}
                  onClick={() => setStatus(value)}
                  aria-pressed={status === value}
                >
                  {t(value === 'all' ? 'filterAll' : value === 'live' ? 'filterLive' : 'filterLow')}
                </Button>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colProduct')}</TableHead>
                <TableHead>{t('colCategory')}</TableHead>
                <TableHead>{t('colPrice')}</TableHead>
                <TableHead>{t('colStock')}</TableHead>
                <TableHead>{t('colRoast')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('colActions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.origin && (
                          <p className="text-muted-foreground text-xs">{product.origin}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {formatVnd(product.priceVnd)}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">{product.stock}</TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {product.roastDate || '—'}
                  </TableCell>
                  <TableCell>
                    {!product.isActive ? (
                      <Badge variant="destructive">{t('statusPaused')}</Badge>
                    ) : product.stock === 0 ? (
                      <Badge variant="destructive">{t('statusSoldOut')}</Badge>
                    ) : isLowStock(product) ? (
                      <Badge variant="warning">{t('statusLow')}</Badge>
                    ) : (
                      <Badge variant="success">{t('statusLive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/catalog/${product.slug}/edit`}>{t('edit')}</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/product/${product.slug}`}>{t('view')}</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {visible.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('noMatch')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
