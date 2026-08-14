# Pattern: plain function component

Named export, arrow function, implicit-return JSX when there's no logic
before the render.

```tsx
export const PriceTag = ({ amount, currency = 'USD' }: PriceTagProps) => (
  <span className="text-sm font-medium tabular-nums">
    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
  </span>
);
```

Drop to a block body only once something has to run before the return
(a hook call, a derived value, an early-return guard):

```tsx
export const ProductCard = ({ product }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;

  if (!product.imageUrl) return null;

  return (
    <article className="rounded-lg border p-4">
      <h3>{product.name}</h3>
      {isOutOfStock && <span className="text-red-600">Out of stock</span>}
    </article>
  );
};
```

## Checklist

- [ ] Named export, not `export default`, unless the file is a Next.js
      route/layout/page entry (those require default exports).
- [ ] Props typed via an exported `interface <Component>Props`.
- [ ] `'use client'` only if the component needs state, effects, browser
      APIs, or event handlers — otherwise leave it a server component.
- [ ] Implicit-return arrow body unless a hook/derived value/guard forces a
      block body.
- [ ] Styling composed through `cn()` (`src/lib/utils.ts`), not string
      concatenation.
