# Pattern: custom hooks

Nothing lives under `src/hooks/` yet — this is the target shape for the
first one. Shared, stateful logic used by 2+ components belongs here, named
`use*`; logic used by exactly one component can stay inline in that
component instead.

```ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
```

## Checklist

- [ ] File name matches the hook name: `useMediaQuery.ts` exports `useMediaQuery`.
- [ ] Guard any browser-only API (`window`, `document`, `localStorage`) for
      the server-render pass — Next.js renders this on the server first.
- [ ] Effects clean up subscriptions/listeners/timers in the returned function.
- [ ] Return a primitive or a stable-shaped object; don't return a new object
      literal every render if the caller might use it as a dependency.
- [ ] A colocated `<hookName>.test.ts` using `@testing-library/react`'s
      `renderHook` covers the hook's behavior once it does anything non-trivial.
