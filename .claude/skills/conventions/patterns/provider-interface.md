# Pattern: provider interfaces (payment, shipping, video, email, auth)

Every external service that could plausibly be swapped later — payment
gateway, courier, video host, email sender, auth provider — sits behind a
small interface in `src/lib/providers/<concern>/types.ts`, with per-vendor
adapters implementing it and a factory in `<concern>/index.ts` picking the
active one. Pages and route handlers call the interface, never a vendor SDK
or vendor name directly. See `AGENTS.md` → Stack for the full rationale and
the current six concerns (payment, courier, local-handoff, video, email,
auth).

```ts
// src/lib/providers/email/types.ts
export interface EmailProvider {
  sendReceipt(order: { id: string; total: number; email: string }): Promise<void>;
}

// src/lib/providers/email/resend.ts (added when the adapter is actually wired up)
import type { EmailProvider } from './types';
export class ResendEmailProvider implements EmailProvider {
  async sendReceipt(order) {
    /* only file that imports the Resend SDK */
  }
}

// src/lib/providers/email/index.ts
import type { EmailProvider } from './types';
export const getEmailProvider = (): EmailProvider => {
  throw new Error('EmailProvider not implemented until Phase 3');
  // once wired: return new ResendEmailProvider();
};

// app/api/checkout/route.ts
const email = getEmailProvider();
await email.sendReceipt(order); // never `new ResendEmailProvider()` here, never `resend.emails.send(...)`
```

## Checklist

- [ ] `types.ts` defines the interface and its plain data types only — no
      vendor SDK types leak into it.
- [ ] Each vendor adapter lives in its own file (`zalopay.ts`, `resend.ts`,
      ...) and is the _only_ file that imports that vendor's SDK.
- [ ] `index.ts` exports a `get<Concern>Provider()` factory; it's the only
      file that knows more than one adapter exists.
- [ ] Pages/route handlers call the factory + interface methods, never a vendor
      SDK or a vendor's HTTP API directly.
- [ ] A concern with no adapter yet keeps its factory throwing
      `not implemented` rather than a half-built adapter file.

The rule targets **coupling, not the word**: a vendor's name is fine as display
text (a payment tile reading "ZaloPay") or as stored data (`Order.paymentProvider`).
What's forbidden is `import`ing the vendor's SDK, or calling its API, outside the
adapter. See `docs/BUILD-PLAN.md` §3.1 for the grep.

Adding a new vendor for an existing concern is a new adapter file plus one
line in that concern's `index.ts` — never a change to a page.
