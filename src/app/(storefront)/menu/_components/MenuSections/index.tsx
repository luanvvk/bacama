'use client';

import { type MenuCatalogItem } from '@/services/catalog/get-menu-items';
import { formatVnd } from '@/lib/format-price';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';

export interface MenuSectionsProps {
  sections: [string, MenuCatalogItem[]][];
  sectionLabels: Record<string, string>;
}

export const MenuSections = ({ sections, sectionLabels }: MenuSectionsProps) => {
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
          <ul className="mt-3 divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-sm">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {formatVnd(item.priceVnd)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label={`Add ${item.name} to cart`}
                    onClick={() => handleAdd(item)}
                  >
                    Add
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
