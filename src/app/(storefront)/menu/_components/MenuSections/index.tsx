'use client';

import { useTranslations } from 'next-intl';

import { type MenuCatalogItem } from '@/services/catalog/get-menu-items';
import { formatVnd } from '@/lib/format-price';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import { CardMedia } from '@/components/ui/CardMedia';

export interface MenuSectionsProps {
  sections: [string, MenuCatalogItem[]][];
  sectionLabels: Record<string, string>;
}

export const MenuSections = ({ sections, sectionLabels }: MenuSectionsProps) => {
  const t = useTranslations('Menu');
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);

  const handleAdd = (item: MenuCatalogItem) => {
    addItem({ id: item.id, name: item.name, priceVnd: item.priceVnd, kind: 'menu' });
    openCart();
  };

  return (
    <div className="mt-8 space-y-10">
      {sections.map(([section, items]) => (
        <div key={section}>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            {sectionLabels[section] ?? section}
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="group flex flex-col">
                <CardMedia
                  src={item.imageUrl}
                  alt={item.name}
                  aspect="landscape"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  fallback={
                    <span aria-hidden className="font-heading text-primary text-4xl">
                      {item.name.charAt(0)}
                    </span>
                  }
                />
                <div className="mt-3 flex flex-1 flex-col">
                  <h3 className="font-heading text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {formatVnd(item.priceVnd)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={t('addItemLabel', { name: item.name })}
                      onClick={() => handleAdd(item)}
                    >
                      {t('add')}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
