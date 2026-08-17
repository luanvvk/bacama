# Coffee Workshop — Product Requirements Document

> Source: `coffee-plan.html` rev 5 · Owner: founder · Status: approved plan, awaiting Phase 0 build · Last updated: 2026-08-12

This document turns the approved rev-5 plan into a PRD: a single source of truth for **what** to build, **why**, for **whom**, and **what tasks** make up each phase. It is written to be read by a developer (you, or a coding agent in a fresh session) who has not read the plan HTML. Cross-references to the plan are by part number so the two stay linked but not duplicated.

---

## 1. Product summary

A Vietnamese roastery and café company with three sites (two live, one opening) sells western-style bakery (croissants, kouign-amann, carrot cake, pain au chocolat, cinnamon scroll), coffee blends retail and wholesale, in-person barista/baking workshops, and online barista/baking courses. The product is one Next.js web app: a Vietnamese-default storefront with an English switch, an end-to-end bean shop with nationwide shipping, a teacher-led course platform with paid video lessons, and a light multi-site staff area for the things the POS does not own.

The POS owns in-store sales, best-sellers, busiest hours and ingredient depletion — out of scope. The roastery's batch/yield/green-lot bookkeeping is out of scope. The app owns only what the POS does not: the storefront, the catalog, online orders, shipping, courses and students.

**Why this shape:** the plan (Part two and Part four) removes the two biggest schedule risks — a POS integration that could lock a phase behind a vendor decision, and a roastery module that asked for a mobile logging habit nobody has. What remains shippable in 10–11 weeks by one developer.

---

## 2. Goals and non-goals

### Goals

1. A storefront that loads under 2.5 s LCP on a mid-range Android over 4G and makes a stranger believe, in five seconds, that a real bakery and roastery stands behind it.
2. Default experience in Vietnamese, switchable to English in one tap with no reload and no layout shift; every committed string goes through `next-intl` from day one.
3. Bean and blend e-commerce, end-to-end in-app: browse → cart → ZaloPay/MoMo/card/COD → GHN ships nationwide → tracking link → receipt.
4. Fresh-cake lane handed off to GrabFood deep-links today, owned end-to-end via GrabExpress later under the same `CourierProvider` interface.
5. Course platform: browse → enroll (in-person seat or online access) → pay → watch signed video lessons → progress → certificate; teachers post documents and video and reply to comments.
6. A staff area that sets price, stock and roast date on blends, adds and times bakery items, publishes announcements, and edits store locations — without ever competing with what the POS does.
7. Every external provider behind one small interface each, with the provider's name appearing only in its own adapter file.

### Non-goals

1. Reporting on POS data, best-sellers, busiest hours, ingredient depletion. The POS already does this well.
2. Roastery batch logging, yield maths, green-lot cost tracking, inter-site bean transfers as a ledger. Out of operational scope.
3. Cross-channel combined reporting, a `SalesFact` table, a nightly rollup, or any dashboard the POS already serves.
4. A React Native app, a CMS, a NestJS backend, a Docker deployment, Redis, a message broker, or a data warehouse (Part eight, "Deliberately absent").
5. Card data on our domain, video bytes on our domain, or any provider SDK imported outside its adapter file.

---

## 3. Personas

**Lan, 28, Da Nang, regular customer.** Reads Vietnamese. Pays with MoMo or ZaloPay on her phone, picks up beans at Site 1, sometimes orders a carrot cake for a family birthday. Will not use a card-only checkout.

**Tom, 34, Manchester, in Vietnam for a month.** Reads English. Mostly mobile. Came for the croissants, stays for the coffee. Will buy a 250 g bag and an online barista course. Pays by card because he doesn't have a Vietnamese e-wallet.

**Ms. Hằng, 41, owner.** Adds blends and bakery items, sets the roast date, publishes a "today's bake" announcement, and trusts the POS for everything that happens at the till.

**Anh Minh, 36, instructor.** Posts a lesson, attaches a handout, replies to comments from his students, marks attendance at the in-person session he teaches at Site 2.

**Trang, 25, staff at Site 3.** Shelves 30 bags of Da Lat washed on a Tuesday and updates stock and roast date in one form. Never logs a roast.

---

## 4. Scope as phases

Phases from Part seven of the plan, with a one-line "gate" definition and a duration. Tasks for each phase are in §6.

| Phase | Name                                               | Gate (definition of done)                                                                                                                                                                                                      | Estimate  |
| ----- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 0     | Foundation + `Site` + i18n                         | App deploys to Vercel; `Site` row exists in Neon; `vi`/`en` toggle works with no English-only string committed. Two fonts subsetted and self-hosted.                                                                           | 2–3 days  |
| 1     | Storefront — home, featured items, three locations | Home renders hero + 3 featured cards + 3 locations + header toggle, all under the perf budget (`LCP < 2.5 s`, hero `< 60 KB`). Menu and per-site pages static with ISR. GrabFood link on pastry cards; checkout stub on beans. | 2 weeks   |
| 2     | Course catalogue + accounts                        | Clerk logs a student in as `student` role; `Enrollment` row exists for an in-person and an online course; "my learning" page lists them. Instructor and admin roles wired; enrollments created manually for now.               | 1.5 weeks |
| 3     | Payments + nationwide bean shipping                | A real VN checkout, end-to-end: cart → ZaloPay or MoMo (and card sandbox + COD) → `Order` row written via webhook → GHN shipment created → tracking → receipt email. Abandoned-checkout path tested.                           | 1.5 weeks |
| 4     | Course player                                      | Enrolled student can resume a video where they left off, see signed playback, download a handout, comment. Instructor can post a lesson and reply. Comments blocked for non-enrolled.                                          | 2 weeks   |
| 5     | Staff admin + bakery + bean shop                   | Site-scoped staff can set price, stock and roast date on a blend; add and time a bakery item; publish an announcement; see today's online orders and shipments. Bean shop links the phase-3 checkout to the catalog.           | 2 weeks   |

**Total: 10–11 weeks.** Operational value lands ~week 6; customer-facing value lands ~week 3 (storefront) and ~week 8 (online courses).

---

## 5. Functional requirements

### 5.1 Storefront (Phase 1)

- **FR-1.1** Home shows one weighted hero image (WebP/AVIF, `< 60 KB`), one tagline in Vietnamese with an English secondary line, three featured items (one coffee blend, one bakery, one class) rotating by `featuredUntil`, and three location cards with photo, hours, today's roast.
- **FR-1.2** Header is 48 px sticky, collapses to a word-mark on scroll, carries a cart icon, a language toggle (`vi` ↔ `en`), and one primary CTA.
- **FR-1.3** `/menu` is statically generated; `/sites/[slug]` carries hours, address, an embed map and today's announcement.
- **FR-1.4** Product cards show: name (vi/en), origin, roast level, tasting notes, weight/grind selector inline, price in VND (USD secondary when `locale=en`), and roast date as "roasted 3 days ago".
- **FR-1.5** Bakery cards show "baked at 5am", a sell-out-by clock, and a delivery-mode tag (`pickup` | `GrabFood`).
- **FR-1.6** Performance budget enforced at PR review: LCP `< 2.5 s`, CLS `< 0.1`, INP `< 200 ms`, home-route JS `< 150 KB` gzipped.

### 5.2 Catalog and product (Phase 5 + cross-phase)

- **FR-5.1** A `Product` has: `slug`, `name` (vi/en), `priceVnd`, `priceUsd`, `stock`, `reorderLevel`, `origin`, `roastLevel`, `tastingNotes`, `weight`, `grindOptions[]`, `roastDate`, `featuredUntil`.
- **FR-5.2** Stock decrements on paid online order; never goes negative silently — an oversell blocks at checkout and surfaces a staff alert.
- **FR-5.3** Bakery item has `bakesAt`, `sellOutBy`, `siteId`, `handoff = pickup | grabfood | courier`.
- **FR-5.4** Announcement has `siteId` (null = all sites), `body` (vi/en), `startsAt`, `endsAt`, `isActive`; rendered on home and per-site page.

### 5.3 Checkout and payment (Phase 3)

- **FR-3.1** The three-page Vietnamese flow from Part six of the plan is the default for `locale=vi`. Page 1: vertical method tiles — ZaloPay, MoMo, VNPay QR, bank transfer, card, COD — with a sticky total bar. Page 2: gateway redirect or in-page QR with a "Đang xử lý…" polling screen. Page 3: "Cảm ơn" receipt, polling the webhook with a 30 s timeout.
- **FR-3.2** `locale=en` follows the same shape, with card promoted to the top and COD retained below the foreign card.
- **FR-3.3** `PaymentProvider` interface (Part eleven) with adapters `zalopay.ts`, `momo.ts`, `payos.ts`, `vnpay.ts`, `bankTransfer.ts`, `cod.ts`. Pages call `getPaymentProvider(routing).pay(...)`; never `zaloPay(...)`.
- **FR-3.4** Webhooks: one handler per provider, all writing the same `Order` row through `parseWebhook()`. Receipts read from `Order`, never from provider payloads.
- **FR-3.5** COD creates the order with `status = awaiting_cod`. No redirect, no webhook. The staff queue drives it to `completed` when the courier collects.
- **FR-3.6** Abandoned-checkout path tested end-to-end and watched by a release sweep (Inngest or Vercel Cron).

### 5.4 Shipping (Phase 3 + cross-phase)

- **FR-3.7** `CourierProvider` interface with `createShipment()` and `trackShipment()`; GHN adapter implements the nationwide lane for beans and blends.
- **FR-3.8** Fresh-cake lane uses `LocalHandoff.buildHandoffLink()` to render a GrabFood deep-link today; swap to a GrabExpress `CourierProvider` adapter later under the same interface.
- **FR-3.9** Customer order page reads `Shipment.status`, `trackingNo`, `deliveredAt` — never the courier's raw payload.

### 5.5 Courses (Phase 2 + 4)

- **FR-2.1** Clerk signs up a student; `User.role = student`. Instructor and admin roles live alongside.
- **FR-2.2** A `Course` has `format in_person | online | hybrid`; an in-person course has `Session` rows with `siteId` and `seatsBooked/capacity`.
- **FR-2.3** Enrollment buys a seat (seat-hold with `holdExpiresAt`) **or** online access — both create one `Enrollment`. Seat-hold release sweep runs on Inngest/Cron.
- **FR-4.1** `Lesson` rows under a `Course → Module`; each carries `videoId`, `durationSec`, `isFreePreview`.
- **FR-4.2** `VideoProvider.getSignedPlayback(videoId, userId)` embeds signed playback from Cloudflare Stream for paid lessons; `youtube.ts` serves free-preview lessons as unlisted.
- **FR-4.3** Progress row writes `secondsWatched` and `completedAt`; resume position restored on lesson open.
- **FR-4.4** Comments limited to enrolled students; attachments via UploadThing free tier (2 GB).
- **FR-4.5** Certificate generated on `Enrollment.status = completed`; serial + `pdfUrl`.

### 5.6 Staff area (Phase 5)

- **FR-5.5** `requireRole(['instructor','admin'])` guards the staff area. `User.homeSiteId` scopes a staff user to one site; admins cross sites.
- **FR-5.6** Blends form: set `priceVnd`, `priceUsd`, `stock`, `roastDate`, `featuredUntil`. No ledger, no movements, no batch numbers.
- **FR-5.7** Bakery item form: name (vi/en), `bakesAt`, `sellOutBy`, `siteId`, `handoff` toggle.
- **FR-5.8** Announcement editor with active window and site scope.
- **FR-5.9** Location editor: address, hours, isActive, today's roast tag.
- **FR-5.10** A simple "today's online orders and shipments" view for authorized staff — print-ready. No POS data, no cross-channel rollup.

### 5.7 i18n (Phase 0, enforced throughout)

- **FR-0.1** Default locale `vi`. `next-intl` middleware derives `locale` from `Accept-Language`, defaulting to `vi` for any VN IP, `vi` otherwise.
- **FR-0.2** Strings live in `/messages/vi.json` and `/messages/en.json` only. A PR with a hard-coded English or Vietnamese literal in a JSX/TSX file does not merge.
- **FR-0.3** Header toggle sets a cookie, re-renders the route, no full reload, no layout shift.
- **FR-0.4** Date and currency format through the i18n layer: `vi` shows VND only; `en` shows VND with USD alongside.

### 5.8 Typography (Phase 0, enforced throughout)

- **FR-0.5** **Fraunces** (Google Fonts, SIL Open Font License) for display headings. **Be Vietnam Pro** for body and UI. Both verified on a real Vietnamese diacritical paragraph before commit.
- **FR-0.6** Self-hosted as subsetted `.woff2` (Vietnamese + Latin subsets) so the font payload stays inside the home-route JS budget.
- **FR-0.7** Fallback chain ends in `ui-sans-serif, system-ui, sans-serif` so a missing font never collapses layout.

### 5.9 Mood and brand (cross-phase, enforced at PR review)

The home page should leave the visitor feeling _"I want to walk into this place on a Sunday morning and sit with my family."_ Constraints from Part five of the plan:

- **MO-1** Page background `#F2F1EC` warm paper, never pure white. Ink `#1E1A17`, accent terracotta `#A8642E`. No gradients.
- **MO-2** Photography is film-emulation, not studio sweep. Hands in frame. The real shop, not a set. Tight crops — crumb, pour, dust.
- **MO-3** Copy uses `us/we/our family`. Specific Vietnamese place names (Da Nang, Hội An, Đà Lạt). One anecdote per page.
- **MO-4** Foreign names stay foreign — "kouign-amann" with a Vietnamese subtitle, not a translation. Roast levels and origins bilingual.
- **MO-5** Borrow one trending element at a time (spring 2025: oversized tight-set type, single hand-drawn footer illustration, "roast of the week" rotating card). No trendy motion — no parallax, no scroll-jacking, no rubber-banding.
- **MO-6** No propagandist Vietnamese iconography (cone hats, red flags, water puppets). No fake-vintage "handwritten" fonts. No invented "as featured in" strips. No autostarting carousels faster than 8 s.

---

## 6. Phase tasks

> **How to use this section.** One phase at a time. Each task is sized to be one PR or one focused evening. Don't start Phase _n_+1 until Phase _n_ tasks are merged and the gate in §4 is met.

### Phase 0 — Foundation + `Site` + i18n (2–3 days)

| #   | Task                                                                                                                                                                                                                                                                                               | Files / Contracts                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 0.1 | Init Next.js 15 (App Router) + TypeScript strict + Tailwind + shadcn/ui. CVA, clsx, tailwind-merge configured.                                                                                                                                                                                     | `package.json`, `tailwind.config.ts`, `cn()` util              |
| 0.2 | Create Neon project via Prisma. First migration creates `Site` (`id`, `slug`, `name`, `timezone`, `address`, `hours`, `isActive`). Seed three rows: Site 1, Site 2, Site 3.                                                                                                                        | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` |
| 0.3 | Install `next-intl`. Create `/messages/vi.json`, `/messages/en.json` with the home page strings only (hero tagline, three CTAs, header labels). Configure middleware: derive locale from `Accept-Language`, default `vi` for VN IPs and `vi` otherwise, header toggle sets cookie, no full reload. | `i18n.ts`, `middleware.ts`, `messages/*.json`                  |
| 0.4 | Add Fraunces and Be Vietnam Pro. Subset to Vietnamese + Latin, self-host as `.woff2`. Configure `next/font` or `@fontsource`. Verify both render on the test paragraph `"Hương vị nghèo — chưa từng hứa hẹn"`. Fail-build check: no Vietnamese-only string in JSX.                                 | `app/fonts.ts`, `public/fonts/*.woff2`                         |
| 0.5 | Apply the mood palette (`#F2F1EC`, `#1E1A17`, `#A8642E`) to Tailwind tokens. No gradients, pure white forbidden.                                                                                                                                                                                   | `tailwind.config.ts`, `app/globals.css`                        |
| 0.6 | Wire Vercel deploy (Hobby now; switch to Pro before commercial launch — Hobby forbids commercial use).                                                                                                                                                                                             | `vercel.json` minimal, env vars                                |
| 0.7 | Copy the six provider interfaces from Part eleven of the plan into `/lib/providers/{payment,courier,local-handoff,video,email,auth}/types.ts`. Empty adapter files. Factory stubs that throw `NotImplemented` until Phase 3.                                                                       | `lib/providers/**/*.ts`                                        |
| 0.8 | Add PR-checklist: "If `zalopay                                                                                                                                                                                                                                                                     | momo                                                           | ghn | clerk | resend | cloudflare`appears outside its own adapter file, the PR does not merge." Add it to`AGENTS.md`or`.github/pull_request_template.md`. | PR template |

**Gate:** `vercel deploy` succeeds; `/` renders a placeholder in `vi` with the toggle to `en`; `Site.findMany()` returns three rows in a server component. No hard-coded string. Both fonts render Vietnamese diacritics correctly.

### Phase 1 — Storefront — home, featured items, three locations (2 weeks)

| #    | Task                                                                                                                                                                                                      | Files / Contracts                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1.1  | Hero block: weighted image (priority `next/image`), tagline (`messages.{vi,en}.hero.tagline`), one primary CTA. Captions via i18n, never inline.                                                          | `app/[locale]/(storefront)/page.tsx`, `components/hero.tsx` |
| 1.2  | Featured carousel: three cards (coffee blend, bakery, class) selected by `featuredUntil >= now()`. Rotate daily; no auto-play faster than 8 s. Featured card carries its own CTA.                         | `components/featured-cards.tsx`, `lib/catalog/featured.ts`  |
| 1.3  | Locations-as-cards: three `Site` rows rendered as cards with photo, hours, today's roast tag, a `/sites/[slug]` link. Static via `generateStaticParams`.                                                  | `app/[locale]/(storefront)/sites/[slug]/page.tsx`           |
| 1.4  | `/menu` static page with ISR (60 min). Coffee blends grouped by roast level; bakery grouped by hour of day; never a never-ending grid.                                                                    | `app/[locale]/(storefront)/menu/page.tsx`                   |
| 1.5  | Product card: name (locale), origin, roast level, tasting notes, weight + grind selector inline, price in VND (USD when `en`), roast date as "roasted N days ago" computed client-side.                   | `components/product-card.tsx`                               |
| 1.6  | Bakery card: bakes-at and sell-out-by as a live freshness badge; handoff tag (`pickup` or `GrabFood` deep-link via `LocalHandoff.buildHandoffLink`).                                                      | `components/bakery-card.tsx`                                |
| 1.7  | Header: 48 px sticky; collapses to word-mark on scroll; logo, language toggle, cart icon, one primary CTA. No chat widget above the fold.                                                                 | `components/site-header.tsx`                                |
| 1.8  | Footer: founding line in Vietnamese first ("We started roasting in our Da Nang kitchen in 2017"), three contact blocks (one per site), language toggle second. One hand-drawn footer illustration.        | `components/site-footer.tsx`                                |
| 1.9  | Lighthouse CI gate on PR for home + site routes: LCP `< 2.5 s`, CLS `< 0.1`, INP `< 200 ms`, JS bundle `< 150 KB` gzip.                                                                                   | `lighthouserc.json`                                         |
| 1.10 | Photography brief handed to the founder: weighted hero (pour, croissant stack, or roast drum at `< 60 KB`), three location façades, five product tight crops. Film-emulation, hands in frame, real light. | `docs/photography-brief.md`                                 |

**Gate:** A first-time visitor on a mid-range Android over 4G loads the home in under 2.5 s LCP and recognises, in five seconds, that the brand is a real bakery and roastery in Da Nang. The Vietnamese is correct; the English toggle works without a reload. Pastry cards link to GrabFood; bean cards link to a stub "checkout coming soon".

### Phase 2 — Course catalogue + accounts (1.5 weeks)

| #   | Task                                                                                                                                                                                       | Files / Contracts                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 2.1 | Install Clerk. Implement the `AuthProvider` adapter (`/lib/providers/auth/clerk.ts`) exposing `requireRole()` and `getCurrentUser()`. The adapter returns the `AuthUser` from Part eleven. | `lib/providers/auth/clerk.ts`, `lib/providers/auth/index.ts` |
| 2.2 | Prisma: `User` (`clerkId`, `email`, `name`, `role`, `preferredLocale`, `homeSiteId`), `Course`, `Session`, `Module`, `Lesson`, `Enrollment`. Roles: `student                               | instructor                                                   | admin`. | `prisma/schema.prisma`, migration |
| 2.3 | Course pages: `/courses` (list), `/courses/[slug]` (detail with `format`, `level`, `price`, in-person sessions with `siteId` and remaining seats). Both static via ISR.                    | `app/[locale]/(storefront)/courses/`                         |
| 2.4 | "My learning" route for signed-in students: lists enrollments with status and continuing-lesson links.                                                                                     | `app/[locale]/me/learning/page.tsx`                          |
| 2.5 | Manual enrollment admin form (Phase 2 only, removed in Phase 5): admin opens a user, picks a course, creates an `Enrollment` row.                                                          | `app/[locale]/admin/enrollments/`                            |
| 2.6 | Language toggle remembered on `User.preferredLocale` after first sign-in.                                                                                                                  | Clerk webhook handler                                        |

**Gate:** Logged-in-as-student flow runs end-to-end: Clerk login → `/courses` → course detail → admin enrolls them → `/me/learning` shows the enrollment. No payment yet.

### Phase 3 — Payments + nationwide bean shipping (1.5 weeks)

| #    | Task                                                                                                                                                                                                                                                                                                 | Files / Contracts                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 3.1  | Add `Product.priceVnd`, `priceUsd` and pay flow tables: `Order`, `OrderItem`, `Shipment`. Migration stores `paymentProvider`, `providerRef`, `routing`.                                                                                                                                              | `prisma/schema.prisma`, migration              |
| 3.2  | Implement `PaymentProvider` adapters — `zalopay.ts`, `momo.ts`, `payos.ts` (card sandbox), plus `cod.ts` (no redirect, no webhook). VNPay QR and bank transfer can ship as stubs that fall through to "contact us" if vendor approval is slow — they are behind the interface, so no refactor later. | `lib/providers/payment/*.ts`                   |
| 3.3  | Checkout page 1: tile method picker per FR-3.1. Sticky bottom bar with VND total and "Thanh toán" CTA. Tile order: ZaloPay, MoMo, VNPay QR, bank transfer, card, COD.                                                                                                                                | `app/[locale]/checkout/method/page.tsx`        |
| 3.4  | Checkout page 2: call `getPaymentProvider(routing).pay(...)`; either redirect to gateway (ZaloPay/MoMo/card) or render an in-page QR (VNPay QR / bank transfer) or fall straight through (COD). Polling screen "Đang xử lý…" with 30 s webhook timeout.                                              | `app/[locale]/checkout/process/page.tsx`       |
| 3.5  | Checkout page 3: "Cảm ơn" receipt. Pulls from `Order`, never provider payload.                                                                                                                                                                                                                       | `app/[locale]/checkout/return/page.tsx`        |
| 3.6  | Webhook routes: one per provider. All call `getPaymentProvider(...).parseWebhook(rawBody, headers)` and write the same `Order` row. Signature verification in the adapter file, never in a page.                                                                                                     | `app/api/webhooks/payment/[provider]/route.ts` |
| 3.7  | Implement `CourierProvider` with the GHN adapter. On `Order.status = paid` and `lane = nationwide`, call `createShipment()` and write `Shipment`.                                                                                                                                                    | `lib/providers/courier/ghn.ts`                 |
| 3.8  | Customer order page: tracking from `Shipment.status` and `trackingNo`; CourierProvider's `trackShipment()` refreshes on visit.                                                                                                                                                                       | `app/[locale]/me/orders/[id]/page.tsx`         |
| 3.9  | Email — implement `EmailProvider` with the Resend adapter. Receipt on paid, reminder on `Enrollment` 24 h before `Session.startsAt`.                                                                                                                                                                 | `lib/providers/email/resend.ts`                |
| 3.10 | Abandoned-checkout test plan: simulate card-session expiry, abandoned-with-redirect, and webhook-delay. Sweep via Inngest or Vercel Cron.                                                                                                                                                            | `docs/abandoned-checkout-tests.md`             |
| 3.11 | Seat-hold release sweep: `Enrollment.holdExpiresAt` swept by Inngest/Cron.                                                                                                                                                                                                                           | `lib/sweeps/seat-hold.ts`                      |

**Gate:** A real ZaloPay or MoMo payment (or sandbox-mode in dev) buys one bag of coffee end-to-end: tile → app switch → return → "Cảm ơn" → receipt email → GHN shipment created → `/me/orders/[id]` shows the tracking number. COD path creates an `awaiting_cod` order without redirect. Abandoned-checkout tests pass.

### Phase 4 — Course player (2 weeks)

| #   | Task                                                                                                                                                                                                    | Files / Contracts                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 4.1 | Lesson route reads `Lesson.videoId`. `VideoProvider.getSignedPlayback(videoId, userId)` returns `embedUrl` from Cloudflare Stream (paid) or YouTube unlisted (free preview). Token carries `expiresAt`. | `app/[locale]/me/courses/[slug]/[lesson]/page.tsx`                  |
| 4.2 | Resume position: write `Progress.secondsWatched` on timeupdate (debounced). On lesson open, seek to saved position.                                                                                     | `components/video-player.tsx`                                       |
| 4.3 | Progress model: `Progress` (`enrollmentId`, `lessonId`, `secondsWatched`, `completedAt`). Lesson complete sets `completedAt` and recomputes `Enrollment.status`.                                        | `lib/courses/progress.ts`                                           |
| 4.4 | Handouts: attachment upload via UploadThing to `lesson.attachments[]`. Enrolled-only download; signed URLs.                                                                                             | `lib/lessons/attachments.ts`                                        |
| 4.5 | Comments: `lessonId`, `userId`, `body`, `parentId`, `deletedAt`. Read by enrolled-students-only (Auth check on route handler, UI check on the component). Instructor replies with same component.       | `app/api/lessons/[id]/comments/route.ts`, `components/comments.tsx` |
| 4.6 | Course builder (staff): create `Module` and `Lesson` rows, upload video direct to Cloudflare Stream (signed upload), set `isFreePreview`. UI for instructor role only.                                  | `app/[locale]/admin/courses/[slug]/builder/page.tsx`                |
| 4.7 | Certificate: on all-lessons complete, generate `Certificate` (`serial`, `issuedAt`, `pdfUrl`) via a PDF stub (or Resend-templated for now).                                                             | `lib/courses/certificate.ts`                                        |

**Gate:** An enrolled student can open lesson 1 of a paid course, resume lesson 2 from where they left, comment, download a handout, and receive a certificate on completion. A non-enrolled visitor cannot watch paid video or comment.

### Phase 5 — Staff admin + bakery + bean shop (2 weeks)

| #   | Task                                                                                                                                                                                                           | Files / Contracts                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 5.1 | Staff area layout: `requireRole(['instructor','admin'])`. `homeSiteId` scopes staff; admin sees all. Left-rail nav, no public widgets ever leak into the public bundle (route-level code splitting mandatory). | `app/[locale]/admin/layout.tsx`                |
| 5.2 | Blends form (Phase 5 Catalog): set `priceVnd`, `priceUsd`, `stock`, `roastDate` (date picker), `featuredUntil`. No batches, no movements.                                                                      | `app/[locale]/admin/products/[id]/page.tsx`    |
| 5.3 | Bean shop: link `Product` to the Phase 3 checkout. Cart adds `Product` with `weight` and `grind` chosen. Reuses the phase-3 `pay()` and GHN `createShipment()`.                                                | `lib/catalog/cart.ts`                          |
| 5.4 | Bakery form: name (vi/en), `bakesAt`, `sellOutBy`, `siteId`, `handoff`. Fresh-cake card on the storefront reflects immediately.                                                                                | `app/[locale]/admin/bakery/[id]/page.tsx`      |
| 5.5 | Announcement editor: body (vi/en), `startsAt`, `endsAt`, `isActive`, `siteId` (null = all). Renders on home and per-site page.                                                                                 | `app/[locale]/admin/announcements/`            |
| 5.6 | Location editor: address, hours, `isActive`, today's roast tag per `Site`.                                                                                                                                     | `app/[locale]/admin/sites/[id]/page.tsx`       |
| 5.7 | "Today's online orders and shipments": print-ready view of the day's `Order` + `Shipment` rows for authorized staff. No POS data, no cross-channel rollup.                                                     | `app/[locale]/admin/today/page.tsx`            |
| 5.8 | Roles scope check: a staff user with `homeSiteId` cannot edit another site's bakery item or announcement; admin can.                                                                                           | `lib/auth/scoped.ts`                           |
| 5.9 | Roster and attendance: in-person `Session.attendedBy[]` checkable by the instructor of that course.                                                                                                            | `app/[locale]/admin/sessions/[id]/attendance/` |

**Gate:** Ms. Hằng adds a bakery item, publishes an announcement, sets today's roast date on a blend, and prints today's online orders — all without the POS. Trang shelves bags at Site 3 with one form. Anh Minh marks attendance at his session.

---

## 7. Data model (summary)

From Part eight of the plan. **Gone from rev 3:** `SalesFact`, `StockMovement`, `RoastBatch`, `GreenLot`, `StockItem` — they existed to support POS reporting and roast yield, neither of which the app does.

- **Core:** `Site`, `Enrollment`, `Product` (with `stock` + `roastDate`), `Order` / `OrderItem`, `Shipment`.
- **Bakery & storefront:** `BakeryItem`, `MenuItem` (display only), `Announcement`.
- **Teaching:** `Course`, `Session`, `Module` / `Lesson`, `Progress` / `Attendance`, `Comment` / `Attachment`, `Certificate`.
- **Identity:** `User` (`clerkId`, `email`, `name`, `role`, `preferredLocale`, `homeSiteId`).

Full field listings live in Part eight of the plan; the schema is the source of truth once Phase 0 starts.

---

## 8. Tech stack

| Layer         | Decision                                                       | Notes                                                                           |
| ------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router)                                        | Pages, route handlers, staff area, all in one app.                              |
| Language      | TypeScript strict                                              | No `any` without `// eslint-disable-next-line` and a reason.                    |
| Styling       | Tailwind + shadcn/ui + CVA + clsx + tailwind-merge             | Reusable variants via CVA.                                                      |
| i18n          | `next-intl`                                                    | `vi` default, `en` switchable. Strings only in `/messages/*`.                   |
| DB            | Neon Postgres via Prisma                                       | Free tier covers years at this size.                                            |
| Auth          | Clerk (Phase 2)                                                | Behind `AuthProvider` interface; Auth.js swap is a new adapter, not a refactor. |
| Payments      | ZaloPay + MoMo + card (PayOS) + VNPay QR + bank transfer + COD | All behind `PaymentProvider`.                                                   |
| Shipping      | GHN nationwide; GrabFood handoff now, GrabExpress later        | Behind `CourierProvider` + `LocalHandoff`.                                      |
| Video         | Cloudflare Stream (paid) + YouTube unlisted (free preview)     | Behind `VideoProvider`.                                                         |
| Email         | Resend                                                         | Behind `EmailProvider`.                                                         |
| Cron / sweeps | Inngest or Vercel Cron                                         | Seat-hold release, abandoned-checkout, certificate issue.                       |
| Uploads       | UploadThing free tier (2 GB)                                   | For handouts and photos.                                                        |
| Deploy        | Vercel Hobby → Pro before commercial launch                    | Hobby forbids commercial use.                                                   |
| Domain        | $12/yr                                                         | Unblocks Resend verification.                                                   |

**Deliberately absent (Part eight):** NestJS, a separate API, Docker, Redis, a message broker, React Native, a CMS, a data warehouse, and any provider-specific SDK imported outside its adapter file.

---

## 9. Provider interfaces (the contract)

Full TypeScript lives in Part eleven of the plan, copied verbatim into `/lib/providers/{concern}/types.ts` in Phase 0 task 0.7.

| Concern       | Interface         | Verbs                                              |
| ------------- | ----------------- | -------------------------------------------------- |
| Payment       | `PaymentProvider` | `pay()`, `parseWebhook()`, `refund()`              |
| Courier       | `CourierProvider` | `createShipment()`, `trackShipment()`              |
| Local handoff | `LocalHandoff`    | `buildHandoffLink()`                               |
| Video         | `VideoProvider`   | `getSignedPlayback()`, `isPreview()`               |
| Email         | `EmailProvider`   | `sendReceipt()`, `sendReminder()`, `sendContact()` |
| Auth          | `AuthProvider`    | `requireRole()`, `getCurrentUser()`                |

**Reviewer rule (Phase 0 task 0.8):** if `zalopay`, `momo`, `ghn`, `clerk`, `resend`, or `cloudflare` appears anywhere outside its own adapter file, the PR does not merge.

---

## 10. Mood and brand constraints (enforced at PR)

Restated here so a developer doesn't need to read Part five to hold the line:

1. Warm paper `#F2F1EC`, warm ink `#1E1A17`, terracotta accent `#A8642E`. No pure white. No gradients.
2. Film-emulation photography with hands in frame and real light. Tight crops — crumb, pour, dust. Hands are the family-and-craft signal.
3. Copy uses `us/we/our family`. Specific Vietnamese place names. One anecdote per page.
4. Foreign names stay foreign with a Vietnamese subtitle. Roast levels and origins bilingual.
5. One trending element at a time, rotated quarterly. No trendy motion.
6. No propagandist Vietnamese iconography, no fake-vintage fonts, no "as featured in" placeholder strips, no autostart carousels faster than 8 s.
7. The home should leave a visitor feeling _"I want to walk into this place on a Sunday morning and sit with my family."_ Anything that doesn't move them closer to that is decoration and doesn't ship.

Detailed references to study (Part five): Onyx, Blue Bottle, Stumptown, Tartine, Square Mile, La Colombe, Verve — borrow patterns, not pixels.

---

## 11. Risks (Part nine, distilled)

1. **Building anything that assumes two sites** — every entity needs `siteId` from migration one.
2. **Duplicating what the POS owns** — the app never writes best-sellers, busiest hours, cash, or ingredient depletion.
3. **Reaching for roastery data** — green-lot cost, yield, batch numbers re-introduce a ledger nobody fills in. Hold the line.
4. **Hard-coded copy in a component** — every string through `next-intl`.
5. **A font that breaks Vietnamese diacritics** — verify both fonts on a real VN diacritical paragraph before commit.
6. **Importing a provider SDK outside its adapter file** — the death of "swap later".
7. **A heavy storefront** — hold the perf budget. Reviewers reject LCP regressions.
8. **"Best coffee in town" English** — superlatives destroy craft credibility. Lead with place, time, freshness.
9. **Bakery on the nationwide shipping lane** — two lanes, two interfaces. Never one shipping page pretending they're the same.

---

## 12. Definition of done

Per-phase gates are in §4 and §6. Whole-product release (after Phase 5):

1. A real ZaloPay or MoMo payment completes for one bag of beans and one online course, in `vi` and `en`.
2. GHN creates a shipment and the customer sees a tracking number, with a receipt email.
3. An enrolled student watches a paid lesson, comments, downloads a handout, and earns a certificate.
4. GrabFood deep-link hands fresh cakes off, and the customer lands on the merchant page.
5. Ms. Hằng adds an announcement and a bakery item; Anh Minh marks attendance; Trang shelves bags.
6. Lighthouse passes on home, menu, and per-site routes.
7. No provider name (`zalopay`, `momo`, `ghn`, `clerk`, `resend`, `cloudflare`) appears outside its own adapter file — a grep returns only those adapter files.

---

## 13. What happens next

1. Open `coffee-shop-ui.html` (the mockup delivered alongside this PRD) to align visual contract with the team — this is the target the storefront addresses.
2. In a fresh coding session with **GPT 5.6 Luna** (recommended model per AGENTS.md's Go-plan strategy: `$1.20 / 1M output`, 3.7× cheaper than GLM-5.2 for coding, 5× cheaper than Grok 4.5), start Phase 0 tasks 0.1–0.8 in this order.
3. Hold the Phase 0 gate before opening Phase 1.

---

_End of PRD._
