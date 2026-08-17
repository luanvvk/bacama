import Image from 'next/image';
import Link from 'next/link';

import { type Product } from '@/constants/products';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/shop/PriceTag';

export interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const CATEGORY_LABEL: Record<Product['category'], string> = {
  coffee: 'Coffee blend',
  gift: 'Gift set',
};

export const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const href = `/product/${product.slug}`;

  return (
    <article className="group flex flex-col">
      <Link
        href={href}
        className="bg-muted relative block aspect-4/5 overflow-hidden rounded-lg"
        aria-label={product.name}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes={featured ? '(min-width: 1024px) 33vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.soldOut && (
          <div className="bg-background/85 absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest uppercase">
            Sold out today
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {CATEGORY_LABEL[product.category]}
        </p>
        <h3 className="font-heading mt-1 text-lg">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">{product.description}</p>

        {product.swatches && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.swatches.map((swatch) => (
              <span
                key={swatch}
                className="border-input text-muted-foreground rounded-sm border px-1.5 py-0.5 font-mono text-xs uppercase"
              >
                {swatch}
              </span>
            ))}
          </div>
        )}

        <Badge variant={product.freshnessLow ? 'warning' : 'success'} className="mt-2 w-fit">
          {product.freshness}
        </Badge>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <PriceTag priceVnd={product.priceVnd} />
          <Link href={href} className="text-primary text-sm font-medium hover:underline">
            {product.soldOut ? 'Notify me' : 'Choose'}
          </Link>
        </div>
      </div>
    </article>
  );
};
