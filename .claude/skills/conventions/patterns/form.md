# Pattern: `react-hook-form` + zod forms

Real, current components — `src/components/form/ControlledInput/index.tsx`
(same shape for `ControlledSelect`, `ControlledTextarea`,
`ControlledCheckbox`): each wraps react-hook-form's `Controller` around one
`src/components/ui/` primitive, and renders its label/error through the
shared `src/components/form/FormField` layout.

No page wires one of these up yet — this is the target shape for the first
one, combining a schema from
[patterns/zod-schema.md](./patterns/zod-schema.md) with `useForm`:

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ControlledInput } from '@/components/form/ControlledInput';
import { Button } from '@/components/ui/Button';
import { newsletterSignupSchema, type NewsletterSignupValues } from '@/lib/schemas/newsletter';

export const NewsletterSignupForm = () => {
  const { control, handleSubmit, formState } = useForm<NewsletterSignupValues>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: NewsletterSignupValues) => {
    // call the relevant src/services/ function here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <ControlledInput control={control} name="email" label="Email" type="email" />
      <Button type="submit" disabled={formState.isSubmitting}>
        Subscribe
      </Button>
    </form>
  );
};
```

## Checklist

- [ ] `useForm` always gets a `resolver: zodResolver(schema)` — no
      hand-rolled validation in the submit handler.
- [ ] Field UI comes from `src/components/form/Controlled*` — don't wire
      `Controller` directly in a page/feature component; add a new
      `Controlled*` there first if the primitive you need doesn't have one
      yet.
- [ ] `defaultValues` set for every field — an uncontrolled-to-controlled
      warning means one was missed.
- [ ] Submit button disabled via `formState.isSubmitting` (or
      `formState.isValid` when you want to block submission until valid)
      rather than tracking a separate `useState` flag.
- [ ] The submit handler calls a `src/services/` function, never `fetch`
      directly — see [patterns/service.md](./patterns/service.md).
- [ ] Server-side errors (e.g. "email already registered") surface via
      `form.setError('email', { message })`, not a generic toast, when
      they're attributable to a specific field.
