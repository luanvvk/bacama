# Bacama — Build Plan

> **Status:** active. Supersedes the phase ordering in `coffee-shop-prd.md` §4/§6.
> **Last updated:** 2026-08-17
> **Audience:** whoever picks this up next — human or AI agent.

---

## 0. How to use this document

Read **§1–§5 before writing any code**, then **§6.0 (delivery model)**, then only
the phase you're working on. Phases are ordered: don't start phase _n+1_ until
phase _n_'s exit criteria are met.

**The single most important thing in §6.0:** everything is built against free
tiers and sandbox credentials. Real merchant accounts, a real domain, and
production keys are a go-live task (§11), and **no phase waits on vendor
approval.** The target is a complete app, not early revenue.

For _how_ to make design decisions and how much to build in one go, see
[DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md). This document is the what; that
one is the why and the how-much.

Three companion documents exist and are **not** superseded by this one:

| Doc                    | Still authoritative for                                                              |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `AGENTS.md`            | Stack, conventions, commands, working principles. **Read first, always.**            |
| `DESIGN-PRINCIPLES.md` | How to make design decisions, scope discipline, solo-with-agents working process     |
| `coffee-plan.html`     | Business rationale, provider-interface reasoning, brand/mood/perf constraints, risks |
| `coffee-shop-prd.md`   | Functional requirements (FR-\* / MO-\* ids), personas, mood constraints              |
| `coffee-shop-ui.html`  | One visual option for the storefront — **reference only, see §3**                    |

Where this doc and the PRD disagree on **ordering or task breakdown**, this doc
wins. Where they disagree on **a functional requirement**, the PRD wins — flag
the conflict rather than silently picking.

---

## 1. Current state (as of 2026-08-17)

**The single most important thing to understand: the UI already exists.** All
storefront, course, and admin pages are built and passing tests. They render
**hardcoded data** from `src/constants/*.ts`, and every write action is a
`toast()` placeholder. This project is _not_ "build the pages" — it is
**"replace mock data with a real data layer, and replace placeholder writes
with real provider calls."** An agent that starts building pages from scratch
has misread the situation.

### What exists and works

| Area          | Routes                                                                                                                                                                                 | Backed by                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Storefront    | `/`, `/shop`, `/product/[slug]`, `/story`, `/contact`, `/subscribe`, `/wholesale`, `/faq`, `/gift-cards`, `/press`, `/careers`, legal pages                                            | `src/constants/products.ts`           |
| Checkout      | `/checkout`, `/checkout/pay`, `/checkout/done`                                                                                                                                         | `src/constants/checkout.ts` + Zustand |
| Courses       | `/courses`, `/learn`, `/teach`                                                                                                                                                         | `src/constants/courses.ts`            |
| Account       | `/me`, `/account`, `/login`, `/register`                                                                                                                                               | `GuestGate` — honest "not signed in"  |
| Admin         | `/admin` + `orders`, `orders/[ref]`, `shipments`, `shipments/[tracking]`, `catalog`, `catalog/[slug]/edit`, `bakery`, `menu`, `sites`, `staff`, `students`, `courses`, `announcements` | `src/constants/admin.ts`              |
| Design system | `src/components/ui/*` (shadcn, folder-per-component), `src/components/form/Controlled*`, "paper & ink" tokens in `globals.css`, Fraunces + Be Vietnam Pro                              | —                                     |
| Data layer    | `prisma/schema.prisma` (validated, **never migrated**), `src/lib/prisma.ts`                                                                                                            | —                                     |
| Providers     | `src/lib/providers/{payment,courier,local-handoff,video,email,auth}/` — interfaces + factories that **throw**                                                                          | —                                     |

### What does not exist

- **No database.** No `prisma/migrations/`, no Neon project. `DATABASE_URL` in `.env` is Prisma's local placeholder.
- **No seed script.** `prisma/seed.ts` is not written; `prisma.config.ts` has no `migrations.seed` entry.
- **No i18n.** `next-intl` not installed. Every string is English-only, hardcoded in JSX.
- **No auth.** `@clerk/nextjs` not installed. No middleware, no session, no roles.
- **No provider adapters.** All six factories throw `not implemented`.
- **No route handlers.** `src/app/**/route.ts` — none exist. No `src/services/` either.
- **No real writes anywhere.** Every admin/checkout mutation is a `toast()`.

---

## 2. Settled architecture decisions — do not relitigate

Each of these was decided deliberately. If you think one is wrong, **raise it
with the owner** rather than quietly building the alternative.

| #   | Decision                                                                                                                                       | Why                                                                                                                                                                                                                                  | What would flip it                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| D1  | **One repo, one Next.js app. No separate backend service.**                                                                                    | The two heavy jobs bypass the server entirely: card data goes to the gateway's hosted page, video bytes go CDN→browser. A separate API would add a hop and a second deployment for no gain.                                          | >3 engineers; long-lived websockets; heavy CPU work; an API consumer that isn't our own product.                  |
| D2  | **Route Handlers (`app/**/route.ts`) for anything a mobile app might need — not Server Actions.**                                              | Route Handlers are plain HTTP/JSON, callable by any client. A future React Native app becomes a second client of the same API, not a reason to build a second service. Server Actions are RPC callable only from our own React tree. | Nothing — this is free insurance. Server Actions remain fine for web-only form posts (e.g. admin-internal forms). |
| D3  | **Custom build — not Shopify / Haravan / Sapo + an LMS bolt-on.**                                                                              | MoMo has no native Shopify integration and ZaloPay only via a third-party connector. SaaS + LMS-bolt-on splits cart, accounts, and design across two products. Unified account across shop+courses is core here.                     | A pivot away from either courses or Vietnamese-first payments.                                                    |
| D4  | **Prisma 7 + Neon Postgres.** Driver adapter (`@prisma/adapter-pg` + `pg`) is **mandatory** in Prisma 7 for SQL providers.                     | —                                                                                                                                                                                                                                    | —                                                                                                                 |
| D5  | **Clerk for auth**, behind the `AuthProvider` interface.                                                                                       | Free to 10k MAU; React Native SDK exists (supports D2).                                                                                                                                                                              | Outgrowing free tier, or wanting to cut vendor lock-in → Auth.js as a new adapter.                                |
| D6  | **Vietnamese is the default locale**, English via toggle.                                                                                      | Primary market.                                                                                                                                                                                                                      | —                                                                                                                 |
| D7  | **The light "paper & ink" theme in `globals.css` is the design system.** `coffee-shop-ui.html`'s dark Onyx-style mockup is **reference only**. | The PRD's own mood section (§10 / plan Part five) specifies warm paper, never pure white — the dark mockup contradicts it. Same "borrow patterns, not pixels" rule `AGENTS.md` applies to `design/`.                                 | An explicit rebrand decision by the owner.                                                                        |
| D8  | **Every external service sits behind an interface** in `src/lib/providers/<concern>/`.                                                         | Start free, swap later without touching pages.                                                                                                                                                                                       | —                                                                                                                 |
| D9  | **Phase order revised** — payments before accounts/courses (see §6).                                                                           | Beans are the existing revenue. Original PRD order left nothing able to take money until ~week 6. Guest checkout needs no auth, so payments genuinely don't depend on Clerk.                                                         | —                                                                                                                 |
| D10 | **No client-side data-fetching library** (React Query/SWR) yet.                                                                                | Server Components + Route Handlers cover current needs.                                                                                                                                                                              | A screen that genuinely needs client-side cache/refetch — ask first, then record it in `AGENTS.md`.               |

---

## 3. Standing rules — enforced at every PR, every phase

These are not phase tasks. They apply to every line written from here on.

### 3.1 Provider boundary (hard rule)

> If `zalopay`, `momo`, `vnpay`, `ghn`, `grab`, `clerk`, `resend`, `cloudflare`,
> `payos`, `stripe`, or `uploadthing` appears **anywhere outside its own adapter
> file** under `src/lib/providers/<concern>/`, the PR does not merge.

Pages and route handlers call the interface: `getPaymentProvider(routing).pay(...)`,
never `zaloPay(...)`. Adding a vendor = a new adapter file + one line in that
concern's `index.ts`. See `.claude/skills/conventions/patterns/provider-interface.md`.

Verify with: `rg -i 'zalopay|momo|ghn|clerk|resend|cloudflare' src --glob '!src/lib/providers/**'`

### 3.2 Database access

- Always via the shared client: `import { prisma } from '@/lib/prisma'`. Never `new PrismaClient()`.
- Run `pnpm db:generate` after every schema change. `src/generated/prisma` is gitignored — `postinstall` regenerates it on install (this is what keeps Vercel builds working; do not remove that script).
- **Migrations are irreversible in production.** Never run `prisma migrate reset`, `db push --force-reset`, or `db push --accept-data-loss` against a database with real data. Prisma itself blocks these for AI agents without fresh explicit consent — do not work around that; ask.

### 3.3 i18n

- Default `vi`, toggle to `en`. Every user-visible string goes through `next-intl` and lives in `/messages/{vi,en}.json`.
- **A hardcoded user-visible string in a new or modified `.tsx` file does not merge.** (Existing untouched files are grandfathered — see §5.3.)
- **Locale-neutral keys vs editorial copy** (this is the rule the schema follows):
  - **Enums and option keys** (`roastLevel`, `grindOptions`, `MenuItem.section`, `weightOptions`) are locale-neutral identifiers stored once, translated via message files.
  - **Editorial copy** (names, descriptions, tasting notes, addresses, opening hours) gets `*Vi`/`*En` column pairs in the DB.
  - Deciding which: _would a staff member type this differently in each language?_ Yes → column pair. No → key.
- Currency/date formatting goes through the i18n layer: `vi` shows VND only; `en` shows VND with USD alongside.

### 3.4 Security (non-negotiable — see §8 for the review gates)

- Secrets (`DATABASE_URL`, Clerk keys, gateway keys) live in `.env` locally and Vercel env vars in deploy. `.env*` is gitignored — **never commit one, never paste one into a chat transcript or a PR description.**
- Every route handler that mutates data or exposes non-public data starts with an auth/role check via `AuthProvider`. No exceptions, no "it's only admin so nobody will find it."
- Payment webhooks: verify signature **before** any DB write; re-read the expected amount from the `Order` row, **never** trust the amount in the webhook payload.
- Never log a full webhook body, connection string, token, or customer phone/address at `info` level.

### 3.5 Performance budget (storefront routes only)

LCP < 2.5 s, CLS < 0.1, INP < 200 ms on a mid-range Android over 4G. Home-route
JS < 150 KB gzipped, hero image < 60 KB, page weight < 600 KB first paint.
The course player and admin routes are explicitly exempt — they must be
route-split so their weight never reaches the public bundle.

### 3.6 Definition of done for any task

1. `pnpm typecheck` passes.
2. `pnpm lint` passes on changed files (0 errors).
3. `pnpm test` passes; new/changed logic has tests.
4. Provider-boundary grep (§3.1) is clean.
5. For UI work: state explicitly whether it was verified in a real browser. Do not imply verification that didn't happen.
6. For anything touching money, auth, or secrets: §8 review gate cleared.

---

## 4. Data model notes

`prisma/schema.prisma` is the source of truth. Notes an agent needs that the
schema itself can't express:

### 4.1 Deliberate divergences from the PRD

| PRD says                                               | Schema has                                 | Why                                                                                                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Session`                                              | `CourseSession`                            | "Session" next to auth is genuinely ambiguous. Same entity, clearer name.                                                                                                                                                             |
| `Role = student \| instructor \| admin`                | `customer \| staff \| instructor \| admin` | `student` does zero authorization work (lesson access is enrolment-scoped) and mislabels every coffee buyer; `staff` was missing even though the built admin UI already displays it, forcing café staff to be made `admin`. See §4.4. |
| `Order.total`                                          | `subtotalVnd` / `shippingVnd` / `totalVnd` | A single `total` can't produce a correct receipt line-by-line.                                                                                                                                                                        |
| —                                                      | `Order.ref`                                | Human-facing order reference (`#2418`), distinct from the internal `cuid()`. The existing checkout already generates one.                                                                                                             |
| —                                                      | `OrderItem.nameSnapshot`                   | A receipt must show what was bought _at purchase time_, even if the product is later renamed or deleted.                                                                                                                              |
| —                                                      | `BrewGuide` model                          | The existing `/product/[slug]` page renders a brew-guide table; it needed somewhere to live.                                                                                                                                          |
| `StockMovement`, `SalesFact`, `RoastBatch`, `GreenLot` | **absent, deliberately**                   | POS owns in-store sales; the roastery's batch/yield bookkeeping is out of scope. Do not reintroduce these as "small additions" — see risk R3.                                                                                         |

### 4.2 Invariants the database cannot enforce — enforce in application code

| Invariant                                                                                             | Where to enforce                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OrderItem` has **exactly one** of `productId` / `courseId` set.                                      | Order-creation service (Phase 2). Postgres could do a CHECK constraint via raw SQL in a migration; not worth hand-editing a migration until orders exist.                                |
| `stock` never goes negative.                                                                          | Conditional update (`UPDATE ... WHERE stock >= qty`) or a transaction — **never** read-then-write, which races under concurrent checkout. (FR-5.2)                                       |
| `Order.deliveryMode = pickup` ⟹ `pickupSiteId` set; `home_delivery` ⟹ `addressLine` + `province` set. | Zod schema on the checkout form + order-creation service.                                                                                                                                |
| `CourseSession.seatsBooked <= capacity`.                                                              | Seat-hold logic in a transaction (Phase 3).                                                                                                                                              |
| A webhook must not be processed twice.                                                                | `Order.providerRef` is `@unique` — a retried webhook hits a uniqueness violation instead of creating a second paid order. Handle that violation as "already processed", not as an error. |

### 4.3 Derived — never store

`freshness` ("roasted 3 days ago") from `roastDate`; `soldOut` from `stock`;
lesson `completed`/`current` from `Progress`; seats-left from
`capacity - seatsBooked`. The existing mock constants store some of these as
literal strings — that's a mock artifact, not a model to copy.

### 4.4 Identity, roles, and who a "customer" is

Three separate concepts. Conflating them is how authorization bugs happen.

**1. `Role` is privilege only — what you may do.**

```prisma
enum Role { customer  staff  instructor  admin }   // default: customer
```

| Role         | May do                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- |
| `customer`   | Buy beans/pastries/courses; see **own** orders and enrolments. Default on signup.        |
| `staff`      | Site-scoped ops at `homeSiteId`: stock, roast dates, bakery items, menu, today's orders. |
| `instructor` | Own courses: lessons, video, replies, attendance. **No** site ops (decided, see below).  |
| `admin`      | Everything, all sites.                                                                   |

The enum is **flat, not hierarchical.** `requireRole` takes the explicit list of
roles that may pass: `requireRole(['staff','admin'])` for stock,
`requireRole(['instructor','admin'])` for the course builder. **`admin` always
passes** — implement that once in the Clerk adapter so no call site can forget it.

**Role and site are separate axes.** `role` says _what_; `homeSiteId` says
_where_. Both are checked — a `staff` user at Site 1 editing Site 2's bakery
must fail. `homeSiteId` is meaningful for `staff`/`instructor` only.

**2. Relationships are derived — never stored as a role.**

| Concept  | How to get it                                       |
| -------- | --------------------------------------------------- |
| student  | a `User` with ≥1 `Enrollment`                       |
| customer | a `User` with ≥1 `Order` (distinct from the _role_) |

A single-valued enum cannot express "buys coffee **and** takes a course" — which
describes the best customers. And access to a lesson is **never**
`requireRole('student')`; it is "is this user enrolled in _this_ course",
i.e. enrolment-scoped. So `student` as a role would do no authorization work
at all. `/admin/students` is an `Enrollment` query, not a role filter.

**3. A guest has no `User` row at all.** `getCurrentUser()` → `null`;
`Order.userId` → `null`. There is deliberately **no `guest` role** — a role
lives on a `User` row, so having one would invite creating `User` rows for
guests and make "is this a real account?" ambiguous. Guest identity lives where
it belongs: `customerName`, `phone`, `email` snapshotted on the `Order`.
Guest order lookup must therefore be non-enumerable (Task 2.11).

**Decided 2026-08-17:** `instructor` does **not** imply `staff`. A teacher
manages courses, not bean prices. Someone needing both gets the higher role
explicitly. This keeps contract instructors safe to onboard.

---

## 5. Cross-cutting migration strategy

### 5.1 Mock constants → database

`src/constants/{products,courses,admin,checkout}.ts` are the **seed data
source**, not throwaway. Each phase migrates its slice:

1. Write the seed rows in `prisma/seed.ts` from the constant.
2. Add a service in `src/services/<feature>/` that reads via `prisma`.
3. Switch the page/component to the service.
4. Delete the constant **only** when nothing imports it.

`src/constants/routes.ts` and `nav.ts` are route/nav config, **not** data — they stay.

### 5.2 Existing mock data → real content

The mock data uses real product names and Unsplash photos. The names are
correct and match `coffee-shop-ui.html`. The photos are placeholders — only
6 distinct stock images exist sitewide. Real photography is a **Phase 1
blocker** (§6.2) that only the owner can clear.

### 5.3 i18n retrofit — route-by-route, not big-bang

~85 page/component files are English-only and need real Vietnamese copy — a
translation task, not a refactor. A single sweep would also be done twice,
since pages change again when real data lands.

**Strategy:** install the `next-intl` infrastructure in Phase 0 (cheap, and it
stops _new_ English-only strings landing), then migrate each route's strings in
the phase that touches that route. Track remaining routes in §9.

---

## 6. Phases

### 6.0 Delivery model — sandbox throughout, real services at the end

**Read this before the phases.** Two things are deliberately decoupled: _what
gets built_ (the phases) and _when real external services get wired up_ (the
end).

**The owner's stated goal is a complete app, not early revenue.** There is no
cash-flow pressure. So:

- **Everything is built against free tiers and sandbox credentials** — PayOS
  sandbox for card, gateway sandboxes for ZaloPay/MoMo, Clerk free, Neon free,
  Resend free, Cloudflare Stream free, Vercel Hobby.
- **Real merchant accounts, a real domain, and production credentials are a
  go-live task (M3), not a build blocker.** No phase waits on vendor approval.
- Do **not** treat "we could take money now" as a reason to ship early. The
  target is the finished product.

This is also the strongest possible argument for the provider-interface pattern
(§3.1): sandbox→production is exactly the swap the adapters exist for. If
switching to real credentials requires touching a page, the boundary leaked.

#### Still build in thin vertical slices — for a different reason

Revenue isn't the motive, but slicing still is. A slice that runs all the way
through — one product, one payment method, one order, one receipt — **surfaces
integration problems while there is still slack to absorb them**. A complete
data layer with no checkout has proved nothing; the same work sliced proves the
whole path. See [DESIGN-PRINCIPLES.md §6](DESIGN-PRINCIPLES.md).

So within Phase 2, get **one** payment method working end-to-end on sandbox
before adding the other five. Within Phase 1, get **one** page reading real
data before converting the rest. Vertical, then wide.

---

#### M1 — Walking skeleton (sandbox)

**Definition of done:** on sandbox credentials, an order goes all the way
through — cart → checkout → sandbox gateway → verified webhook → `Order` row →
receipt email → visible to the owner. Nothing is real except the code.

Purpose: prove the architecture end-to-end and find the integration surprises
early. Not customer-facing.

Needs: Phase 0 tasks 0.6–0.8, plus Phase 2 tasks 2.1, 2.2, 2.4–2.8, 2.10, with
**one** sandbox adapter (PayOS sandbox is simplest — no merchant approval at
all) plus `cod.ts`, which needs no gateway in any environment.

**What is _not_ deferred, even on sandbox:** webhook signature verification,
amount re-read from `Order`, replay protection. Write the money path correctly
the first time — sandbox is for testing the integration, not an excuse for
sloppy logic that "gets fixed before launch." It won't.

#### M2 — Feature complete (still sandbox)

All phases done. Every feature works, every provider on a sandbox or free tier.
This is the real bulk of the work and where most of the time goes.

Exit: every phase's exit criteria met; nothing left that only works "in theory."

#### M3 — Go live

The credential swap and the operational readiness work. **This is its own piece
of work, not an afterthought** — see §11.

---

> **Risk of deferring real services to the end** (accepted deliberately, but
> know it): sandbox behaviour is not identical to production — real 3-D Secure
> flows, real bank timeouts, different error codes, real webhook latency. Those
> surprises land at M3, when there is least slack. Two cheap mitigations:
> **(a)** start merchant-account paperwork whenever convenient, since approval
> is bureaucratic, can require business documents, and can be refused —
> discovering that at M3 is a schedule risk, and registering early costs nothing
> because you needn't use the account; **(b)** at M3, do a handful of small real
> transactions before announcing anything.

---

### Phase 0 — Foundation

**Goal:** a deployed app with a real database, i18n infrastructure, and provider
contracts in place. No user-visible feature change.

**Exit criteria:** `/` renders in Vietnamese with a working `en` toggle;
`prisma.site.findMany()` returns 3 seeded rows from a server component; Vercel
deploy succeeds; provider-boundary grep clean.

| #    | Task                                                                                                                                                            | Files                                             | Done when                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| 0.1  | ✅ Prisma 7 + `@prisma/adapter-pg` + `pg` installed; shared client                                                                                              | `src/lib/prisma.ts`                               | **done**                                        |
| 0.2  | ✅ Full schema authored and validated                                                                                                                           | `prisma/schema.prisma`                            | **done**                                        |
| 0.3  | ✅ Six provider interfaces + throwing factories                                                                                                                 | `src/lib/providers/**`                            | **done**                                        |
| 0.4  | ✅ `postinstall: prisma generate` (keeps Vercel builds working)                                                                                                 | `package.json`                                    | **done**                                        |
| 0.5  | ✅ Provider-boundary rule in PR template + conventions skill                                                                                                    | `.github/pull_request_template.md`                | **done**                                        |
| 0.6  | Create Neon project; put connection string in `.env` **and** Vercel env vars                                                                                    | `.env` (never committed)                          | owner                                           |
| 0.7  | Run first migration (`pnpm db:migrate --name init`); commit `prisma/migrations/`                                                                                | `prisma/migrations/`                              | migration applied, committed                    |
| 0.8  | Write seed script: 3 Sites, products from `constants/products.ts`, courses from `constants/courses.ts`. Add `migrations.seed` to config. Needs `tsx`.           | `prisma/seed.ts`, `prisma.config.ts`              | `pnpm exec prisma db seed` populates a fresh DB |
| 0.9  | Install `next-intl`; middleware (default `vi`, cookie toggle, no reload/layout shift); `/messages/{vi,en}.json` seeded with header+footer strings only          | `middleware.ts`, `src/i18n.ts`, `messages/*.json` | Toggle flips header/footer with no reload       |
| 0.10 | Verify Fraunces + Be Vietnam Pro render stacked diacritics: `"Hương vị nghèo — chưa từng hứa hẹn"`. Swap Be Vietnam Pro → Noto Sans Vietnamese if a mark drops. | `src/app/layout.tsx`                              | Visually confirmed in a browser                 |
| 0.11 | Confirm Vercel deploy still succeeds with the DB wired                                                                                                          | —                                                 | Deploy green, no 404s                           |

**Blockers:**

- **B0-a (owner, hard):** Neon project + connection string. Blocks 0.7–0.8, and therefore all later phases. Put it in `.env` directly — do not send it through chat.
- **B0-b (decision):** seed data — use the three real sites from the mockup (Ngô Quyền/Đà Nẵng, Phố cổ/Hội An, An Thuận/Đà Nẵng opening Sept 2026)? Assumed yes unless told otherwise.
- **B0-c (owner):** Vietnamese copy for header/footer strings. Small at this stage.
- **B0-d (risk):** `.env` must never be committed. Verify `git status` shows no `.env` before every commit.

**Do not do in this phase:** any provider adapter, any page rewrite, any auth work.

---

### Phase 1 — Storefront on real data

**Goal:** the public storefront reads from Postgres instead of hardcoded arrays,
in Vietnamese, within the performance budget.

**Exit criteria:** `/`, `/shop`, `/product/[slug]`, `/menu`, `/sites/[slug]` all
render from the DB; Vietnamese is correct and reviewed by a native speaker;
Lighthouse meets §3.5 on home + product; bean cards still route to a checkout
stub; pastry cards deep-link to GrabFood.

| #    | Task                                                                                                                      | Files                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1.1  | `src/services/catalog/` — `getProducts`, `getProductBySlug`, `getFeaturedProducts` (by `featuredUntil`), `getBakeryItems` | `src/services/catalog/*`                        |
| 1.2  | `src/services/sites/` — `getSites`, `getSiteBySlug`, `getActiveAnnouncements`                                             | `src/services/sites/*`                          |
| 1.3  | Switch `TodaysStockSection`, `CafesSection`, `WorkshopsSection`, `HeroSection` to services; delete their mock imports     | `src/app/(storefront)/_components/*`            |
| 1.4  | Switch `ShopBrowser` + `/product/[slug]` (incl. `ProductTabs` brew guide, origin story, gallery) to services              | `src/app/(storefront)/shop/`, `product/[slug]/` |
| 1.5  | **New** `/menu` route — static + ISR, `MenuItem` grouped by `section`                                                     | `src/app/(storefront)/menu/page.tsx`            |
| 1.6  | **New** `/sites/[slug]` route — hours, address, map embed, today's announcement, `generateStaticParams`                   | `src/app/(storefront)/sites/[slug]/page.tsx`    |
| 1.7  | Derive freshness client-side from `roastDate` ("roasted N days ago") — replaces the hardcoded `freshness` string          | `src/lib/format-freshness.ts` (+ test)          |
| 1.8  | Implement `LocalHandoff` GrabFood adapter (returns a deep link; nothing syncs back) — the one genuinely trivial adapter   | `src/lib/providers/local-handoff/grabfood.ts`   |
| 1.9  | Migrate all storefront strings to `/messages/{vi,en}.json` (§5.3)                                                         | `messages/*.json` + touched components          |
| 1.10 | ISR/caching strategy: static where possible, `revalidate` on stock-sensitive routes                                       | route segment configs                           |
| 1.11 | Lighthouse CI gate on home + product                                                                                      | `lighthouserc.json`, `.github/workflows/`       |

**Blockers:**

- **B1-a (owner, hard):** real photography. Weighted hero (pour / croissant stack / roast drum, < 60 KB WebP), 3 site façades, ~5 tight product crops. Film-emulation, hands in frame, real light (MO-2). Until then Unsplash placeholders stay and the storefront **cannot be called launch-ready**.
- **B1-b (owner, hard):** Vietnamese copy for the whole storefront, reviewed by a native speaker. Machine translation is not acceptable for brand copy (MO-3: "us/we/our family", specific place names, one anecdote per page).
- **B1-c (decision):** `/menu` has no mock data at all — `MenuItem` needs real café menu content per site, or the route ships hidden.
- **B1-d (decision):** the nav mega-menu's 4 items all currently point at `/shop`. Real destinations needed (known open issue, pre-existing).
- **B1-e (content):** only 6 distinct stock photos exist sitewide; several are reused across sections. Resolved by B1-a.

**Do not do in this phase:** real payments, auth, admin writes.

---

### Phase 2 — Payments + nationwide bean shipping ← **first revenue**

**Goal:** a customer can buy beans end-to-end and money actually arrives.
**No auth required** — guest checkout (`Order.userId` is nullable by design).

**Exit criteria:** a real (or sandbox) ZaloPay/MoMo payment buys a bag
end-to-end: method tile → app switch/QR → return → "Cảm ơn" → receipt email →
GHN shipment created → tracking visible. COD creates an `awaiting_cod` order
with no redirect. A replayed webhook does **not** create a second order or
double-decrement stock. §8 security gate cleared.

| #    | Task                                                                                                                                                                                             | Files                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 2.1  | Add `email` to the checkout form + zod schema. **Currently not collected — receipts cannot send without it.**                                                                                    | `checkout/_components/CheckoutForm/`                  |
| 2.2  | `src/services/orders/createOrder.ts` — validates cart against live prices/stock, enforces §4.2 invariants, writes `Order` + `OrderItem` in a transaction                                         | `src/services/orders/*`                               |
| 2.3  | Payment adapters: `zalopay.ts`, `momo.ts`, `payos.ts` (card sandbox), `cod.ts` (no redirect/webhook). `vnpay.ts` + `bankTransfer.ts` may ship as honest "contact us" stubs.                      | `src/lib/providers/payment/*.ts`                      |
| 2.4  | Real `getPaymentProvider(routing)` factory: `vi`/VN → ZaloPay then MoMo; `en`/non-VN → card. Customer override always honoured.                                                                  | `src/lib/providers/payment/index.ts`                  |
| 2.5  | Webhook route handler, one per provider. **Signature verified in the adapter before any write.** Amount re-read from `Order`, never from payload. Duplicate `providerRef` = "already processed". | `src/app/api/webhooks/payment/[provider]/route.ts`    |
| 2.6  | Replace simulated `setTimeout` payment flow in `/checkout/pay` with real redirect / in-page QR / COD fall-through + polling screen (30 s timeout, honest "still processing" message)             | `checkout/pay/`                                       |
| 2.7  | `/checkout/done` reads the real `Order`, never a provider payload                                                                                                                                | `checkout/done/`                                      |
| 2.8  | Stock decrement on paid — conditional update, never read-then-write (§4.2)                                                                                                                       | `src/services/orders/*`                               |
| 2.9  | GHN `CourierProvider` adapter + `createShipment` on `paid` & `lane=nationwide`                                                                                                                   | `src/lib/providers/courier/ghn.ts`                    |
| 2.10 | Resend `EmailProvider` adapter — receipt on paid                                                                                                                                                 | `src/lib/providers/email/resend.ts`                   |
| 2.11 | Guest order-tracking route (no account needed — `ref` + phone, or a signed link). **Do not make orders enumerable by ref.**                                                                      | `src/app/(storefront)/orders/[ref]/`                  |
| 2.12 | Abandoned-checkout + webhook-delay + card-expiry test plan, and a sweep (Vercel Cron)                                                                                                            | `docs/abandoned-checkout-tests.md`, `src/lib/sweeps/` |
| 2.13 | Migrate checkout strings to `/messages/*` (Vietnamese payment copy: "Thanh toán", "Đang xử lý…", "Cảm ơn")                                                                                       | `messages/*.json`                                     |

**Blockers:**

- **B2-a (not a blocker — sandbox):** ZaloPay/MoMo **production** merchant accounts are an M3 task, not a Phase 2 one (§6.0). Build against sandbox credentials. Registering early is still worth doing as background paperwork — approval is bureaucratic and can be refused — but nothing here waits on it.
- **B2-b (sandbox):** GHN has a sandbox/staging API; use it. Production credentials at M3.
- **B2-c (not a blocker until M3):** a domain is needed to verify a Resend _sending domain_, but the free tier can send from Resend's own test sender to **your own** verified address — enough to build and test 2.10. Real recipients need the domain, so it moves to M3.
- **B2-d (sandbox):** Resend free account. Domain verification at M3.
- **B2-e (infra):** webhooks need a public HTTPS URL. Use a tunnel (e.g. `ngrok`) locally; a Vercel preview deploy works too.
- **B2-e2 (safety):** if a build with sandbox payments is deployed to a public URL, a real person could attempt a real order and believe it succeeded. Keep pre-M3 deploys behind Vercel deployment protection, or label them unmistakably as previews. **Do not leave a sandbox checkout publicly reachable and unlabelled.**
- **B2-f (decision):** VNPay QR and bank transfer — real integrations now, or honest "contact us" stubs? Stubs are fine (they're behind the interface) but the tile list must not offer a method that silently fails.
- **B2-g (legal/business):** refund + delivery-failure policy. `refund()` exists on the interface; someone must decide the actual policy before it's exposed.
- **B2-h (RISK, highest in the project):** this phase handles real money. See §8. Do not ship any part of it without the security gate.

**Do not do in this phase:** courses, auth, admin writes. Course checkout waits for Phase 3 (it needs a `User`).

---

### Phase 3 — Accounts + course catalogue

**Goal:** real Clerk auth with roles; students can enrol in a course and pay for
it, reusing all Phase 2 payment plumbing.

**Exit criteria:** Clerk login works; `User` row syncs with correct `role`;
`/me` and `/account` show real data instead of `GuestGate`; an in-person seat
booking and an online purchase both create exactly one `Enrollment`; seat-hold
expiry releases seats; role guards verified against a non-privileged account.

| #    | Task                                                                                                                                   | Files                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 3.1  | Install `@clerk/nextjs`; implement `AuthProvider` adapter (`requireRole`, `getCurrentUser`) returning our `AuthUser`                   | `src/lib/providers/auth/clerk.ts`, `index.ts` |
| 3.2  | `<ClerkProvider>` + middleware, composed with the existing `next-intl` middleware (**both** need the request — compose, don't replace) | `src/app/layout.tsx`, `middleware.ts`         |
| 3.3  | Clerk webhook → `User` upsert (`clerkId`, email, name, role, `preferredLocale`). Verify webhook signature.                             | `src/app/api/webhooks/clerk/route.ts`         |
| 3.4  | Replace `/login` + `/register` mock forms with real Clerk flows                                                                        | `login/`, `register/`                         |
| 3.5  | Replace `GuestGate` on `/me` + `/account` with real signed-in data. Keep `GuestGate` for genuinely-not-signed-in states.               | `me/`, `account/`, `src/components/auth/`     |
| 3.6  | `src/services/courses/` — catalogue reads; `/courses` + **new** `/courses/[slug]` detail with sessions and seats-left                  | `src/services/courses/*`, `courses/[slug]/`   |
| 3.7  | Enrolment service: seat-hold (`holdExpiresAt`) for in-person, direct for online; both → one `Enrollment`; seats in a transaction       | `src/services/enrollments/*`                  |
| 3.8  | Course checkout reusing Phase 2 `pay()`; `Order` → `Enrollment` link                                                                   | `checkout/`                                   |
| 3.9  | Seat-hold release sweep (Vercel Cron)                                                                                                  | `src/lib/sweeps/seat-hold.ts`                 |
| 3.10 | `/me/learning` — real enrolments with continue links                                                                                   | `me/learning/`                                |
| 3.11 | Enrolment reminder email 24 h before `CourseSession.startsAt`                                                                          | `src/lib/providers/email/resend.ts`           |
| 3.12 | Migrate course + account strings to `/messages/*`                                                                                      | `messages/*.json`                             |

**Blockers:**

- **B3-a (owner):** Clerk account + API keys (env vars, never committed).
- **B3-b (decision):** how does someone become `instructor`/`admin`? Clerk dashboard manually, an allowlist, or an admin UI? **Security-relevant** — a self-serve path to `admin` is a critical vulnerability. Default assumption: manual promotion in the Clerk dashboard.
- **B3-c (decision):** does existing guest-checkout order history get claimed by a matching account later, or stay guest-only?
- **B3-d (risk):** `middleware.ts` will host both i18n and auth. Getting the composition wrong can silently expose protected routes — needs a test asserting an unauthenticated request to a protected route redirects.
- **B3-e (decision):** `/teach` is currently a `GuestGate` placeholder for what the mockup shows as a full authoring console. Confirm it stays minimal until Phase 4.

**Do not do in this phase:** the video player, course builder, or certificates.

---

### Phase 4 — Course player

**Goal:** an enrolled student can watch paid lessons with signed playback,
resume position, handouts, and comments; instructors can author and reply.

**Exit criteria:** enrolled student opens lesson 1, resumes lesson 2 mid-video,
comments, downloads a handout, gets a certificate on completion. A
**non-enrolled** visitor can watch a free preview but **cannot** obtain a paid
lesson's playback URL, read comments, or download an attachment — verified by
hitting the route handlers directly, not just by checking the UI hides it.

| #    | Task                                                                                                             | Files                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 4.1  | `VideoProvider` adapters: `cloudflare.ts` (signed playback, paid), `youtube.ts` (unlisted, free preview)         | `src/lib/providers/video/*`                  |
| 4.2  | Lesson route with signed playback. **Enrolment checked server-side in the route handler**, not in the component. | `me/courses/[slug]/[lesson]/`                |
| 4.3  | Player + resume: debounced `Progress.secondsWatched` writes; seek to saved position on open                      | `src/components/courses/VideoPlayer/`        |
| 4.4  | Progress → completion → `Enrollment.status` recompute                                                            | `src/services/courses/progress.ts`           |
| 4.5  | Handouts via UploadThing; enrolled-only signed download                                                          | `src/services/lessons/attachments.ts`        |
| 4.6  | Comments route handler + component; enrolled-only read and write; instructor replies; soft delete                | `src/app/api/lessons/[id]/comments/route.ts` |
| 4.7  | Course builder (instructor role): modules, lessons, direct-to-Cloudflare signed upload, `isFreePreview` toggle   | `admin/courses/[slug]/builder/`              |
| 4.8  | Certificate on completion: `serial`, `issuedAt`, `pdfUrl`                                                        | `src/services/courses/certificate.ts`        |
| 4.9  | Replace the `/learn` single-lesson preview with the real player; keep a genuine free-preview path                | `learn/`                                     |
| 4.10 | Route-split so player weight never reaches the public bundle (§3.5)                                              | route configs                                |
| 4.11 | Migrate learn/teach strings to `/messages/*`                                                                     | `messages/*.json`                            |

**Blockers:**

- **B4-a (owner):** Cloudflare account (Stream free tier) + API token.
- **B4-b (owner):** UploadThing account.
- **B4-c (owner, content):** actual course video. Only one lesson ("Module 1 · Lesson 03 — The heart") has real content today; the other 8 are titles only. **The player cannot be meaningfully shipped without real lessons.**
- **B4-d (decision):** signed-URL TTL, and whether concurrent-stream abuse matters. Paid video is leakable content — a long TTL is a revenue risk.
- **B4-e (decision):** comment moderation. Any user-generated content needs a moderation/report path and XSS-safe rendering. **Never render comment bodies as HTML.**
- **B4-f (risk):** authorization is the whole ballgame here. Every check must be server-side; a hidden UI element is not access control.

---

### Phase 5 — Staff admin on real data

**Goal:** the already-built admin console performs real writes, correctly scoped
by role and site.

**Exit criteria:** owner adds a bakery item, publishes an announcement, sets a
roast date, prints today's online orders — all persisted. A site-scoped staff
user provably **cannot** edit another site's data. Every `toast()` placeholder
is either a real write or an honestly-labelled unbuilt feature.

| #    | Task                                                                                                                                                                                                                        | Files                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 5.1  | `requireRole(['staff','instructor','admin'])` on the `/admin` segment — layout **and** every route handler. Per-screen role lists are narrower; see §4.4.                                                                   | `src/app/admin/layout.tsx`             |
| 5.2  | `src/lib/auth/scoped.ts` — `homeSiteId` scoping helper; admin crosses sites, staff don't                                                                                                                                    | `src/lib/auth/scoped.ts`               |
| 5.3  | Catalogue writes: price, stock, `roastDate`, `featuredUntil` (replaces `StockPanel`'s toast). `['staff','admin']`                                                                                                           | `admin/catalog/`, `admin/_components/` |
| 5.4  | Bakery CRUD: names, description, `bakesAt`, `sellOutBy`, `handoff`. `['staff','admin']`                                                                                                                                     | `admin/bakery/`                        |
| 5.5  | Menu CRUD (`section` grouping). `['staff','admin']`                                                                                                                                                                         | `admin/menu/`                          |
| 5.6  | Announcement editor with active window + site scope. `['staff','admin']`                                                                                                                                                    | `admin/announcements/`                 |
| 5.7  | Site editor: address, hours, `isActive`, today's roast. `['admin']` — site config is not day-to-day ops                                                                                                                     | `admin/sites/`                         |
| 5.8  | Orders + shipments on real data; COD → `completed` transition; `trackShipment` refresh. `['staff','admin']`, but **refunds are `['admin']`**                                                                                | `admin/orders/`, `admin/shipments/`    |
| 5.9  | Real KPI tiles (replace hardcoded `KPI_TILES`) — online orders/revenue only. **No POS data, no cross-channel rollup.**                                                                                                      | `admin/_components/KpiTiles/`          |
| 5.10 | Students + staff directories on real `User` data — students via an `Enrollment` query, **not** a role filter (§4.4). `['admin']`; staff-role management is `['admin']` only. **Never expose more PII than the task needs.** | `admin/students/`, `admin/staff/`      |
| 5.11 | Roster + attendance, markable by that course's instructor. `['instructor','admin']` + per-course ownership check                                                                                                            | `admin/sessions/[id]/attendance/`      |
| 5.12 | Delete now-unused mock constants; keep `routes.ts`/`nav.ts`                                                                                                                                                                 | `src/constants/`                       |
| 5.13 | Migrate admin strings to `/messages/*` (lower priority — staff-facing, and staff are Vietnamese-speaking)                                                                                                                   | `messages/*.json`                      |

**Blockers:**

- **B5-a (resolved 2026-08-17):** role→permission matrix is now defined — see §4.4 and the per-task role lists above. Refunds and PII are `admin`-only; `staff` is site-scoped ops. Any _new_ admin screen must state its role list explicitly rather than inheriting the segment guard.
- **B5-b (owner, business):** Vercel Hobby **forbids commercial use** — upgrade to Pro (~$20/mo) before real launch. A suspension mid-launch is exactly the kind of loss to avoid.
- **B5-c (decision):** audit trail for staff writes (who changed a price)? Not modelled. Cheap to add now, expensive after a dispute.
- **B5-d (risk):** admin is the highest-privilege surface. Every route handler needs its own check — a guarded layout does **not** protect a route handler.

---

## 7. Risk register

Carried from `coffee-plan.html` Part nine, re-ordered by what can actually bite
this build, plus risks found during reconciliation.

| id  | Risk                                                                              | Mitigation                                                                                                                                     |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Webhook forgery / replay** — free goods shipped nationwide                      | Signature verified in-adapter before any write; `providerRef @unique`; amount re-read from `Order`                                             |
| R2  | **Missing server-side authorization** — hidden UI mistaken for access control     | Every mutating/private route handler starts with `requireRole`; tested against a non-privileged account                                        |
| R3  | **Scope creep back into POS / roastery territory**                                | POS owns in-store sales, best-sellers, ingredient depletion. No `SalesFact`/`RoastBatch`/`StockMovement`. The catalog needs only a roast date. |
| R4  | **Secret leakage** — `.env` committed, or a connection string pasted into chat/PR | `.env*` gitignored; check `git status` before every commit; secrets go to Vercel env vars, never a transcript                                  |
| R5  | **Stock oversell under concurrency**                                              | Conditional update / transaction, never read-then-write                                                                                        |
| R6  | **Anything assuming a fixed number of sites**                                     | Every site-owned entity already carries `siteId`. Site 3 opens Sept 2026.                                                                      |
| R7  | **Hardcoded copy defeating the language switch**                                  | §3.3; reviewers reject new hardcoded strings                                                                                                   |
| R8  | **A font that breaks Vietnamese diacritics**                                      | Task 0.10 — verify on real stacked-diacritic copy, not Latin samples                                                                           |
| R9  | **Provider SDK leaking outside its adapter**                                      | §3.1 grep + PR checklist                                                                                                                       |
| R10 | **Heavy storefront losing the traffic it earns**                                  | §3.5 budget + Lighthouse CI                                                                                                                    |
| R11 | **Generic English reading as "another Vietnamese café site"**                     | MO-3/MO-4: place, time, freshness. No superlatives.                                                                                            |
| R12 | **Croissants on the nationwide shipping lane**                                    | Two lanes, two interfaces. Beans ship; cakes hand off.                                                                                         |
| R13 | **Solo-dev bandwidth vs 10–11 week scope**                                        | Thin vertical slices within each phase (§6.0); one thing in flight at a time; batch work by what one person can actually review                |
| R14 | **Vercel Hobby commercial-use violation**                                         | Hobby is legitimate while nothing is sold. Pro required at M3, before real transactions — §11                                                  |
| R16 | **Sandbox behaviour ≠ production** — surprises land at M3 with least slack        | §6.0 note: register merchant accounts early as paperwork; run small real transactions at M3 before announcing                                  |
| R17 | **A sandbox checkout reachable by a real customer**                               | B2-e2 — deployment protection or unmistakable preview labelling until M3                                                                       |
| R15 | **Irreversible migration against live data**                                      | Never `migrate reset`/`--force-reset`/`--accept-data-loss` on real data; Prisma's AI consent gate is a backstop, not a workaround target       |

---

## 8. Security review gates

Any PR touching the areas below **stops for explicit review** before merge —
this is a standing instruction from the owner (solo dev, low risk tolerance).
Do not self-approve these.

**Gate 1 — Payments (Phase 2).** Signature verification before any write.
Amount re-read from `Order`, never from the payload. Replay/duplicate handling
proven. No secret in logs. Refund path authorization checked.

**Gate 2 — Auth (Phase 3).** Middleware composition verified: unauthenticated
request to a protected route redirects. No self-serve path to `instructor`/
`admin`. Clerk webhook signature verified.

**Gate 3 — Paid content (Phase 4).** Playback URL and attachment download
authorized server-side. Signed-URL TTL deliberate. Comment bodies never
rendered as HTML.

**Gate 4 — Admin writes (Phase 5).** Every route handler independently
authorized. Site scoping proven with a cross-site attempt. PII exposure
minimal.

**Gate 5 — Any migration against a database with real data.** Reviewed for
data loss, with a stated rollback plan.

---

## 9. Deferred decisions register

Open questions, with the assumption currently in force. Revisit at the phase
noted; **don't silently resolve one in code.**

| id  | Question                                         | Current assumption                                                                      | Decide by                                                    |
| --- | ------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Q1  | Client-side data-fetching library?               | None — Server Components + Route Handlers                                               | When a screen needs client cache                             |
| Q2  | VNPay QR + bank transfer: real or stub?          | Honest stubs behind the interface                                                       | Phase 2                                                      |
| Q3  | How are `staff`/`instructor`/`admin` granted?    | Manual promotion in Clerk dashboard — **no self-serve path to any non-`customer` role** | Phase 3                                                      |
| Q4  | Guest orders claimable by a later account?       | No — guest stays guest                                                                  | Phase 3                                                      |
| Q5  | Signed-video TTL / concurrent-stream abuse?      | Short TTL, no abuse handling                                                            | Phase 4                                                      |
| Q6  | Comment moderation + reporting?                  | None built; comments enrolled-only                                                      | Phase 4                                                      |
| Q7  | ~~Full role→permission matrix?~~                 | **Resolved 2026-08-17** — see §4.4                                                      | done                                                         |
| Q8  | Audit trail for staff writes?                    | Not modelled                                                                            | Phase 5                                                      |
| Q9  | `/menu` real content?                            | Route ships only when content exists                                                    | Phase 1                                                      |
| Q10 | Third locale ever?                               | No — `*Vi`/`*En` columns assume exactly two                                             | If a third is wanted, switch to Json or a translations table |
| Q11 | Nav mega-menu's 4 identical `/shop` links?       | Known issue, unresolved                                                                 | Phase 1                                                      |
| Q12 | `/teach` authoring console scope?                | Minimal placeholder until Phase 4                                                       | Phase 4                                                      |
| Q13 | Subscriptions ("Roast of the week")?             | Out of scope, not modelled                                                              | Post-launch                                                  |
| Q14 | Wholesale ordering (a `/wholesale` page exists)? | Marketing page only, no real flow                                                       | Post-launch                                                  |

---

## 10. External accounts checklist (owner)

Two columns on purpose: what's needed **to build** (free/sandbox — the only
thing that gates a phase) and what's needed **to go live** (M3, §11). **Every
credential goes straight into `.env` locally and Vercel env vars for deploy.
Never into a chat transcript, a commit, or a PR description.**

| Service           | To build (gates a phase)                  | To go live (M3)                                              | Cost when live |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------ | -------------- |
| Neon Postgres     | **Free tier — gates Phase 0**             | same, or paid if size demands                                | Free           |
| PayOS             | Sandbox — simplest card path, no approval | Production keys                                              | Per-tx         |
| ZaloPay           | Sandbox credentials                       | **Merchant account — can be refused; start paperwork early** | Per-tx         |
| MoMo              | Sandbox credentials                       | Merchant account — same                                      | Per-tx         |
| GHN               | Sandbox/staging API                       | Production account                                           | Per-shipment   |
| Resend            | Free account, send to own address         | **Verified domain** (needs the domain)                       | Free 3k/mo     |
| Domain            | not needed                                | ~$12/yr — unblocks Resend + credibility                      | ~$12/yr        |
| Clerk             | Free 10k MAU (dev instance)               | Production instance                                          | Free 10k MAU   |
| Cloudflare Stream | Free tier                                 | same                                                         | Free tier      |
| UploadThing       | Free 2 GB                                 | same                                                         | Free 2 GB      |
| Vercel            | **Hobby is fine while nothing is sold**   | **Pro — Hobby forbids commercial use**                       | ~$20/mo        |

Total cost to build the entire app: **$0.** Total recurring at go-live: roughly
**$20/mo + $12/yr**, plus per-transaction fees.

---

## 11. M3 — Go-live checklist

Everything deferred by the sandbox-throughout decision (§6.0) lands here. **This
is real work, not a switch flip** — budget days, not an afternoon.

### Credentials and accounts

- [ ] Production merchant accounts approved: ZaloPay, MoMo (and PayOS/Stripe if card is offered)
- [ ] GHN production account + credentials
- [ ] Domain purchased, DNS pointed
- [ ] Resend sending domain verified (SPF/DKIM) — receipts to real recipients fail without this
- [ ] Clerk switched from dev to production instance (**dev and prod users are separate — dev accounts do not carry over**)
- [ ] Vercel upgraded to Pro (Hobby forbids commercial use — R14)
- [ ] Every production secret in Vercel env vars; **none in the repo**

### Verification before announcing

- [ ] All five §8 security gates cleared against the production configuration, not just sandbox
- [ ] Small **real** transactions run end-to-end per payment method — money actually arrives in the bank account
- [ ] A real refund executed, to confirm the path works before a customer needs it
- [ ] Webhook signature verification confirmed against production keys (sandbox and prod keys differ)
- [ ] Real receipt email received at a non-owner address, rendering correctly in both locales
- [ ] A GHN shipment booked and tracked for real
- [ ] Vercel deployment protection **removed** (R17) — and confirm nothing else was gating access
- [ ] Lighthouse budget (§3.5) re-checked on the production domain

### Operational readiness

- [ ] Owner knows how to see today's orders and mark COD collected — without a developer
- [ ] Someone is watching for failed payments and stuck `pending` orders
- [ ] A refund/delivery-failure policy exists in writing (was B2-g)
- [ ] Database backups confirmed (Neon's retention on the current tier is understood, not assumed)
- [ ] A rollback plan for the deploy, and for the most recent migration
- [ ] Legal minimum for a Vietnamese online seller reviewed: business licence display, terms, privacy, return policy. **Not a developer decision — confirm with the owner.**

### Known deferred items to re-check at M3

- [ ] Any `/messages/*` route still untranslated (§5.3)
- [ ] Any payment tile still a "contact us" stub (Q2) — remove or implement; never offer a method that silently fails
- [ ] Placeholder photography still in place (B1-a)
- [ ] Nav mega-menu links still pointing at generic `/shop` (Q11)

---

## 12. Quick reference

```bash
pnpm dev                 # dev server
pnpm typecheck           # must pass before done
pnpm lint                # must pass on changed files
pnpm test                # must pass
pnpm db:generate         # after every schema change
pnpm db:migrate          # create + apply a migration (dev only)
pnpm db:studio           # inspect data

# provider-boundary check (must return only adapter files)
rg -i 'zalopay|momo|ghn|clerk|resend|cloudflare' src --glob '!src/lib/providers/**'
```

**Never run** `prisma migrate reset`, `prisma db push --force-reset`, or
`--accept-data-loss` against a database holding real data.
