# Pattern: zod schema

Nothing lives under `src/lib/schemas/` yet — this is the target shape for
the first shared schema. A schema colocated with a single form (e.g. next
to a checkout form component) doesn't need to move here; only schemas
reused by 2+ forms/services do.

```ts
import { z } from 'zod';

export const newsletterSignupSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type NewsletterSignupValues = z.infer<typeof newsletterSignupSchema>;
```

## Checklist

- [ ] Export the schema and its inferred type (`z.infer<typeof schema>`) from
      the same file — never hand-write a parallel interface that can drift
      from the schema.
- [ ] Validation messages are user-facing copy (`'Enter a valid email
address'`), not the zod default (`'Invalid email'`) or a raw code.
- [ ] One schema per form/resource shape — don't share a schema between two
      forms that happen to have similar fields today; they'll diverge.
- [ ] Pass the schema to `react-hook-form` via `zodResolver` (see
      [patterns/form.md](./patterns/form.md)) rather than validating
      manually in a submit handler.
