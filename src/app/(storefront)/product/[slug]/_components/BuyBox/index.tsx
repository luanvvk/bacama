'use client';

import { useState } from 'react';
import { Clock, CreditCard, MapPin, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type Product } from '@/constants/products';
import { formatVnd } from '@/lib/format-price';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/shop/QuantityStepper';

export interface BuyBoxProps {
  product: Product;
}

const PAYMENT_METHODS = ['ZaloPay', 'MoMo', 'VNPay QR', 'Bank transfer', 'Visa · MC', 'COD'];

export const BuyBox = ({ product }: BuyBoxProps) => {
  const t = useTranslations('Product');
  const weightOptions = product.weightOptions ?? ['Standard'];
  const grindOptions = product.grindOptions ?? [{ label: 'Standard' }];

  const assurances = [
    { icon: Clock, text: t('assuranceRoasted') },
    { icon: Truck, text: t('assuranceShipping') },
    { icon: CreditCard, text: t('assuranceCod') },
    { icon: MapPin, text: t('assurancePickup') },
  ];

  const [weight, setWeight] = useState(weightOptions[0]);
  const [grind, setGrind] = useState(grindOptions[0].label);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);

  const handleAddToCart = () => {
    addItem(
      {
        id: `${product.id}-${weight}-${grind}`,
        name: product.name,
        priceVnd: product.priceVnd,
        imageUrl: product.imageUrl,
        options: `${weight} · ${grind}`,
        productId: product.id,
        weight,
        grind,
      },
      quantity,
    );
    openCart();
  };

  return (
    <div className="lg:sticky lg:top-24">
      {product.origin && (
        <p className="text-primary font-mono text-xs tracking-widest uppercase">{product.origin}</p>
      )}
      <h1 className="font-heading mt-2 text-3xl sm:text-4xl">{product.name}</h1>
      <p className="text-muted-foreground mt-3">{product.description}</p>

      {product.tastingNotes && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.tastingNotes.map((note) => (
            <span
              key={note}
              className="border-input text-muted-foreground rounded-full border px-3 py-1 font-mono text-xs uppercase"
            >
              {note}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium">{t('weightLabel')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {weightOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant={option === weight ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWeight(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium">{t('grindLabel')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {grindOptions.map((option) => (
            <Button
              key={option.label}
              type="button"
              variant={option.label === grind ? 'default' : 'outline'}
              size="sm"
              disabled={option.disabled}
              className={cn(option.disabled && 'line-through')}
              onClick={() => setGrind(option.label)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="my-6 flex items-baseline gap-3 border-y py-4">
        <span className="font-heading text-3xl font-semibold tabular-nums">
          {formatVnd(product.priceVnd)}
        </span>
        <span className="text-muted-foreground font-mono text-sm">· {weight}</span>
      </div>

      <div className="flex gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button type="button" className="flex-1" onClick={handleAddToCart}>
          {t('addToCart')}
        </Button>
      </div>
      <Button type="button" variant="outline" className="mt-3 w-full">
        {t('buyNowZalopay')}
      </Button>

      <div className="mt-6 flex flex-col gap-3 border-t pt-4">
        {assurances.map(({ icon: Icon, text }) => (
          <div key={text} className="text-muted-foreground flex items-start gap-2 text-sm">
            <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap gap-1.5 font-mono text-xs uppercase">
        {PAYMENT_METHODS.map((method) => (
          <span key={method} className="border-border rounded-sm border px-2 py-1">
            {method}
          </span>
        ))}
      </div>
    </div>
  );
};
