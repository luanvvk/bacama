# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two distinct primary audiences sharing one platform, not one blended segment:

- **Shop customers** — buy coffee, bread, and bakery goods from Bacama, a small roastery/bakery in Đà Nẵng, Vietnam. Browse catalog, add to cart, check out.
- **Course students** — take baking/coffee courses (`/courses`, `/learn`) independently of the shop; browsing and enrolling don't assume any shop purchase history or vice versa.
- **Admin/staff** — run catalog, orders, shipments, courses, students, and announcements from `/admin`. Team size (solo owner-operator vs. small staff) not yet confirmed — don't assume multi-role permissioning is needed until it comes up.

## Product Purpose

An e-commerce + learning platform for a real small-business roastery/bakery: sell physical products (coffee, bread) online, and separately teach baking/coffee courses online. Two revenue lines under one brand, not one cross-sold experience.

## Positioning

Confirmed brand voice, drawn directly from existing copy (`EntranceOverlay`): _"Bacama · Coffee and more — A small roastery in Đà Nẵng. Bread before the light, coffee by the day's batch."_ Small-batch, artisanal, quietly poetic — not a generic multi-vendor marketplace. The "paper & ink" visual system (warm paper background `#f2efe7`, ink text `#1e1a17`, caramel/amber accent `#96521f`, Fraunces display serif + Be Vietnam Pro body) already carries this voice into the UI; new work should match it rather than default to generic SaaS conventions.

## Operating Context

- Real business, not a portfolio/demo project — design and content decisions should anticipate real photography, copy, and business facts landing here, even where current content is honest placeholder (see Evidence on Hand).
- Built by rebuilding original bilingual (Vietnamese/English) static HTML mockups (`design/` folder, `feature/design-mockups` branch) into Next.js — mockups are visual reference only, not source to copy verbatim.
- Established "honest, not faked" convention: anywhere a backend/auth/upload capability doesn't exist yet, the UI says so explicitly (toast, guest-gate, "Soon" badge) rather than pretending to work. New design work should preserve this rather than paper over gaps with fake data.

## Capabilities and Constraints

- Auth: Clerk is the chosen provider but not wired up yet — no real signed-in state exists anywhere in the app today (see `src/components/auth/GuestGate`).
- i18n: English-only for now; the original mockups were bilingual VI/EN but a bilingual toggle is a deliberately deferred decision, not yet made.
- No data-fetching library chosen yet.
- Admin write actions (stock updates, new products/announcements) currently have no backend — they show an honest toast instead of persisting.

## Brand Commitments

- Name: **Bacama**. Tagline: "Coffee and more."
- Voice: small-batch/artisanal, quietly poetic, warm — not corporate or hype-driven. Example line: "Bread before the light, coffee by the day's batch."
- Visual identity: "paper & ink" palette + Fraunces (display/serif) + Be Vietnam Pro (body) — already implemented in `src/app/globals.css` and `src/app/layout.tsx`. Treat as binding, not a placeholder to redesign away from.

## Evidence on Hand

- Real brand name, tagline, and voice exist (see Brand Commitments) and are already in use in shipped copy.
- No real product photography, course video content, or customer testimonials confirmed on hand yet — current media (e.g. `/media/entrance.mp4`, course lesson content) should be treated as placeholder/demo unless the user says otherwise. Do not fabricate testimonials, pricing claims, or customer counts.

## Product Principles

- Two audiences, one voice: shop and courses stay functionally separate, but both should read as unmistakably Bacama (same palette, type, tone).
- Small-batch over mass-market: avoid generic e-commerce/SaaS visual tropes (stock-photo hero grids, purple-blue gradients, gratuitous badges) in favor of the warm, restrained paper-and-ink identity already established.
- Honest over fake: no capability gets a fake success state; missing backend/auth/data is disclosed in the UI, not hidden.
- Mockups are reference, not source: visual direction should nod to `design/` where it still fits current UX, but isn't obligated to match it pixel-for-pixel.

## Accessibility & Inclusion

No product-specific requirement established yet beyond standard web accessibility practice (this repo already runs `eslint-plugin-jsx-a11y` via `eslint-config-next`, and has an `a11y-reviewer` subagent).
