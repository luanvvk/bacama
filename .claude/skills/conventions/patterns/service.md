# Pattern: services (data access)

Nothing lives under `src/services/` yet — this is the target shape for the
first one. No HTTP client or data-fetching library is chosen yet (see
`AGENTS.md` → Stack); until then, keep services as plain `fetch`-based
async functions with an explicit return type. Don't call `fetch` directly
from a component.

```ts
// src/services/products/getProducts.ts
export interface Product {
  id: string;
  name: string;
  priceCents: number;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  return res.json();
}
```

## Checklist

- [ ] One file per operation (or a small colocated group) under
      `src/services/<feature>/`, not one giant `api.ts`.
- [ ] Exported function name describes the operation (`getProducts`,
      `createOrder`), not a generic `fetchData`.
- [ ] Return type is explicit and exported if other modules need it.
- [ ] Non-OK responses throw rather than returning a silent `null`/`undefined`.
- [ ] Components call the service function, not `fetch`/`axios` directly.

Revisit this doc once a data-fetching library (e.g. TanStack Query) or HTTP
client (e.g. a shared `axios` instance) is adopted — the shape above is a
placeholder, not a long-term commitment.
