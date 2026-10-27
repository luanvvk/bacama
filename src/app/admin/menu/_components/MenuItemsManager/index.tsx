'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Heading, Text } from '@/components/ui/Typography';
import { MENU_SECTIONS } from '@/constants/menu';
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';
import type { AdminMenuItem } from '@/services/catalog/get-admin-menu-items';

import { MenuItemForm } from '../MenuItemForm';

export interface MenuItemsManagerProps {
  items: AdminMenuItem[];
  nextCursor: string | null;
  /** Present only for admin, who may pick any site and sees the site column. */
  siteOptions?: { value: string; label: string }[];
  defaultSiteId: string | null;
}

type EditorState = { mode: 'create' } | { mode: 'edit'; item: AdminMenuItem } | null;

export const MenuItemsManager = ({
  items: initialItems,
  nextCursor: initialCursor,
  siteOptions,
  defaultSiteId,
}: MenuItemsManagerProps) => {
  const t = useTranslations('Admin.menu');
  const tSections = useTranslations('Menu.sections');
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);

  // router.refresh() re-renders the page with a fresh first page; adopt it.
  const [seenItems, setSeenItems] = useState(initialItems);
  if (seenItems !== initialItems) {
    setSeenItems(initialItems);
    setItems(initialItems);
    setNextCursor(initialCursor);
  }

  const showSite = Boolean(siteOptions);
  const canCreate = Boolean(siteOptions?.length || defaultSiteId);

  const groups = MENU_SECTIONS.map((section) => ({
    section,
    rows: items.filter((item) => item.section === section),
  })).filter((group) => group.rows.length > 0);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/menu-items?cursor=${encodeURIComponent(nextCursor)}`,
      );
      if (!response.ok) throw new Error(String(response.status));
      const page: { items: AdminMenuItem[]; nextCursor: string | null } = await response.json();
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      toast.error(t('loadMoreFailed'));
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (item: AdminMenuItem) => {
    const response = await fetch(`/api/admin/menu-items/${item.id}`, { method: 'DELETE' });

    if (!response.ok) {
      toast.error(response.status === 403 ? t('forbidden') : t('deactivateFailed'));
      return;
    }

    toast.success(t('deactivated'));
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading as="h1" size="lg">
            {t('title')}
          </Heading>
          <Text variant="muted" className="mt-1 max-w-2xl">
            {t('description')}
          </Text>
        </div>
        {canCreate && <Button onClick={() => setEditor({ mode: 'create' })}>{t('new')}</Button>}
      </div>

      {groups.length === 0 && <Text variant="muted">{t('empty')}</Text>}

      {groups.map(({ section, rows }) => (
        <section key={section} aria-labelledby={`menu-section-${section}`}>
          <Heading as="h2" size="sm" id={`menu-section-${section}`} className="mb-2">
            {tSections(section)}
          </Heading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                {showSite && <TableHead>{t('site')}</TableHead>}
                <TableHead>{t('price')}</TableHead>
                <TableHead>{t('order')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span>{item.nameEn}</span>
                    <span className="text-ink-faint block text-sm">{item.nameVi}</span>
                    {!item.isActive && <Badge variant="outline">{t('inactive')}</Badge>}
                  </TableCell>
                  {showSite && <TableCell>{item.siteName}</TableCell>}
                  <TableCell>{formatVnd(item.priceVnd)}</TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditor({ mode: 'edit', item })}
                      >
                        {t('edit')}
                      </Button>
                      {item.isActive && (
                        <Button variant="ghost" size="sm" onClick={() => deactivate(item)}>
                          {t('deactivate')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ))}

      {nextCursor && (
        <div className="flex justify-center">
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

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editor?.mode === 'edit' ? t('editTitle') : t('createTitle')}</DialogTitle>
          </DialogHeader>
          {editor && (
            <MenuItemForm
              item={editor.mode === 'edit' ? editor.item : undefined}
              siteOptions={siteOptions}
              defaultSiteId={defaultSiteId ?? siteOptions?.[0]?.value ?? ''}
              onDone={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
