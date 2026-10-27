'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatVnd } from '@/lib/format-price';
import type { BakeryItemFormInput, BakeryItemValues } from '@/lib/schemas/bakery-item';
import { toast } from '@/lib/toast';
import type { AdminBakeryItem } from '@/services/catalog/bakery-item-admin';

import { BakeryItemForm, type BakerySiteOption } from './BakeryItemForm';

interface BakeryItemsManagerProps {
  items: AdminBakeryItem[];
  nextCursor: string | null;
  sites: BakerySiteOption[];
  /** Set for staff: their home site. Null for admin, who may pick any site. */
  lockedSiteId: string | null;
}

type Editing = { mode: 'create' } | { mode: 'edit'; item: AdminBakeryItem } | null;

const toFormInput = (item: AdminBakeryItem): BakeryItemFormInput => ({
  siteId: item.siteId,
  nameVi: item.nameVi,
  nameEn: item.nameEn,
  descriptionVi: item.descriptionVi,
  descriptionEn: item.descriptionEn,
  priceVnd: item.priceVnd,
  bakesAt: item.bakesAt,
  sellOutBy: item.sellOutBy ?? '',
  handoff: item.handoff,
  handoffUrl: item.handoffUrl ?? '',
  isActive: item.isActive,
});

export const BakeryItemsManager = ({
  items: initialItems,
  nextCursor: initialCursor,
  sites,
  lockedSiteId,
}: BakeryItemsManagerProps) => {
  const t = useTranslations('Admin.bakery');
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  // router.refresh() re-renders the page with a fresh first page; adopt it.
  const [seenItems, setSeenItems] = useState(initialItems);
  if (seenItems !== initialItems) {
    setSeenItems(initialItems);
    setItems(initialItems);
    setNextCursor(initialCursor);
  }
  const showSiteColumn = lockedSiteId === null;

  const request = async (url: string, method: string, body?: BakeryItemValues) => {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    });
    if (!response.ok) throw new Error(String(response.status));
    router.refresh();
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/bakery-items?cursor=${encodeURIComponent(nextCursor)}`,
      );
      if (!response.ok) throw new Error(String(response.status));
      const page: { items: AdminBakeryItem[]; nextCursor: string | null } = await response.json();
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      toast.error(t('loadMoreFailed'));
    } finally {
      setLoading(false);
    }
  };

  const save = async (values: BakeryItemValues) => {
    try {
      if (editing?.mode === 'edit') {
        await request(`/api/admin/bakery-items/${editing.item.id}`, 'PATCH', values);
      } else {
        await request('/api/admin/bakery-items', 'POST', values);
      }
      toast.success(t('saved'));
      setEditing(null);
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  const deactivate = async (item: AdminBakeryItem) => {
    try {
      await request(`/api/admin/bakery-items/${item.id}`, 'DELETE');
      toast.success(t('deactivated'));
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  const emptyValues: BakeryItemFormInput = {
    siteId: lockedSiteId ?? sites[0]?.id ?? '',
    nameVi: '',
    nameEn: '',
    descriptionVi: '',
    descriptionEn: '',
    priceVnd: '',
    bakesAt: '',
    sellOutBy: '',
    handoff: 'pickup',
    handoffUrl: '',
    isActive: true,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{t('description')}</p>
        </div>
        <Button onClick={() => setEditing({ mode: 'create' })}>{t('new')}</Button>
      </div>

      {editing && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-heading mb-4 text-lg font-semibold">
              {editing.mode === 'create' ? t('createTitle') : t('editTitle')}
            </h2>
            <BakeryItemForm
              key={editing.mode === 'edit' ? editing.item.id : 'new'}
              defaultValues={editing.mode === 'edit' ? toFormInput(editing.item) : emptyValues}
              sites={sites}
              siteLocked={lockedSiteId !== null || editing.mode === 'edit'}
              submitLabel={editing.mode === 'create' ? t('create') : t('save')}
              onSubmit={save}
              onCancel={() => setEditing(null)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colItem')}</TableHead>
                {showSiteColumn && <TableHead>{t('site')}</TableHead>}
                <TableHead>{t('price')}</TableHead>
                <TableHead>{t('bakesAt')}</TableHead>
                <TableHead>{t('handoff')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('colActions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.nameEn}</p>
                    <p className="text-muted-foreground text-xs">{item.nameVi}</p>
                  </TableCell>
                  {showSiteColumn && <TableCell>{item.siteName}</TableCell>}
                  <TableCell className="font-mono tabular-nums">
                    {formatVnd(item.priceVnd)}
                  </TableCell>
                  <TableCell>{item.bakesAt}</TableCell>
                  <TableCell>{t(`handoff_${item.handoff}`)}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'success' : 'destructive'}>
                      {item.isActive ? t('statusActive') : t('statusInactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing({ mode: 'edit', item })}
                      >
                        {t('edit')}
                      </Button>
                      {item.isActive && (
                        <Button size="sm" variant="ghost" onClick={() => deactivate(item)}>
                          {t('deactivate')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('empty')}</p>
          )}
          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-32"
                onClick={loadMore}
                disabled={loading}
              >
                {t('loadMore')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
