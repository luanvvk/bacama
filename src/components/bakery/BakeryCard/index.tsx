'use client';

import Image from 'next/image';

import { type BakeryCatalogItem } from '@/services/catalog/get-bakery-items';
import { useCartStore } from '@/stores/cart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceTag } from '@/components/shop/PriceTag';

export interface BakeryCardProps {
  item: BakeryCatalogItem;
}

// bakesAt is free text, not a Vi/En pair — every real item currently uses
// this one Vietnamese value, translated locally rather than via a full i18n
// system that doesn't exist yet.
const BAKES_AT_LABEL: Record<string, string> = { 'Hằng ngày': 'Baked daily' };

export const BakeryCard = ({ item }: BakeryCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      priceVnd: item.priceVnd,
      imageUrl: item.imageUrl ?? undefined,
      kind: 'bakery',
    });
    openCart();
  };

  return (
    <article className="group flex flex-col">
      <div className="bg-muted relative aspect-4/5 overflow-hidden rounded-lg">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">Bakery</p>
        <h3 className="font-heading mt-1 text-lg">{item.name}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>

        <Badge variant="success" className="mt-2 w-fit">
          {BAKES_AT_LABEL[item.bakesAt] ?? item.bakesAt}
        </Badge>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <PriceTag priceVnd={item.priceVnd} />
          {item.handoff === 'grabfood' && item.handoffUrl ? (
            <a
              href={item.handoffUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm font-medium hover:underline"
            >
              Order on GrabFood
            </a>
          ) : (
            <Button type="button" size="sm" onClick={handleAddToCart}>
              Add to cart
            </Button>
          )}
        </div>
        {item.handoff === 'pickup' && (
          <p className="text-muted-foreground mt-2 text-xs">Pickup at Lý Tự Trọng</p>
        )}
      </div>
    </article>
  );
};
