# Pattern: plain function component

Lives at `src/components/<location>/<ComponentName>/index.tsx` (own
PascalCase folder, `index.tsx` as the file, tests in a colocated
`__tests__/` folder). Always an arrow function — never `function Name() {}`
— named export, implicit-return JSX when there's no logic before the
render.

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

A Next.js route/layout/page entry still needs a default export, but keep it
an arrow function bound to a name first — `const Home = () => (...)` then
`export default Home;` — never an inline anonymous
`export default () => (...)` or `export default function Home() {}`.

## Checklist

- [ ] Own folder: `<ComponentName>/index.tsx`, tests in `<ComponentName>/__tests__/`.
- [ ] Arrow function, never `function Name() {}`. Named export, unless it's
      a route/layout/page entry — those still bind to a name first, then
      `export default Name` at the bottom, never an inline anonymous export.
- [ ] Props typed via an exported `interface <Component>Props`.
- [ ] `'use client'` only if the component needs state, effects, browser
      APIs, or event handlers — otherwise leave it a server component.
- [ ] Implicit-return arrow body unless a hook/derived value/guard forces a
      block body.
- [ ] If the component forwards a ref (`forwardRef`), set
      `Component.displayName = 'Component'` right after it.
- [ ] Styling composed through `cn()` (`src/lib/utils.ts`), not string
      concatenation, and built from Tailwind's native scale (`rounded-lg`,
      `text-xs`, `p-3`) rather than arbitrary-value classes
      (`rounded-[3px]`, `p-[12px]`) — pick the closest native step. Colors
      are never hardcoded in a className; they're CSS variables in
      `src/app/globals.css` exposed as `--color-*` theme tokens and
      referenced by semantic name (`bg-primary`, `text-ink-faint`).
