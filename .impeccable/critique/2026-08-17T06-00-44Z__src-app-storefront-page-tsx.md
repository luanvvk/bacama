---
target: Home page (src/app/(storefront)/page.tsx)
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-17T06-00-44Z
slug: src-app-storefront-page-tsx
---

Method: dual-agent (A: a6073284591c26372 · B: ab1a05ea707c9ded7)

## Design Health Score

| #         | Heuristic                           | Score     | Key Issue                                                                                                                                                                     |
| --------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status         | 3         | Freshness signals are strong (roast-date badge, AnnouncementBar, per-café "today's roast"), but AnnouncementBar isn't sticky like Header — it scrolls away after ~40px.       |
| 2         | Match Between System and Real World | 3         | Vietnamese geography/currency/payment rails handled fluently. Docked for "Three cafés" stated as present fact while the third site is `comingSoon`.                           |
| 3         | User Control and Freedom            | 3         | EntranceOverlay has two explicit exits (Enter/Skip) + Escape key, and a session gate so it won't re-show mid-session.                                                         |
| 4         | Consistency and Standards           | 2         | The same "image + eyebrow + heading + price/link" card concept is built four separate, slightly different ways across TodaysStockSection, WorkshopsSection, and CafesSection. |
| 5         | Error Prevention                    | 3         | ProductCard's sold-out overlay swaps CTA to "Notify me" instead of leaving a dead "Choose" button — a real, product-specific prevention pattern.                              |
| 6         | Recognition Rather Than Recall      | 3         | Icon-only header buttons carry aria-label; nav is fully visible, nothing hidden behind memorized paths.                                                                       |
| 7         | Flexibility and Efficiency          | n/a       | Not applicable — Persuade-mode landing page, no repeat-task efficiency surface.                                                                                               |
| 8         | Aesthetic and Minimalist Design     | 3         | Generous whitespace and alternating light/dark bands give real rhythm, but three consecutive sections share one visual template and start to blur by the third repetition.    |
| 9         | Error Recovery                      | 3         | Sold-out/coming-soon states get a message + alternate action, though the comingSoon café card isn't visually distinguished from the open ones.                                |
| 10        | Help and Documentation              | n/a       | Not applicable — single-scroll marketing page, no task complex enough to need help.                                                                                           |
| **Total** |                                     | **23/32** | **Good (71.9%)**                                                                                                                                                              |

## Design Specificity Verdict

**Split verdict: the copy layer is unmistakably Bacama; the structural/visual layer is a generic e-commerce template wearing Bacama's words.**

The voice is genuinely grounded and non-portable: "It began with my grandmother's pan," "Taught by the people who bake at five," VND pricing, ZaloPay/MoMo/GHN payment rails, Đà Nẵng/Hội An geography, roast dates — no unrelated brand could drop this text in unchanged.

But strip the copy and the skeleton is interchangeable SaaS/e-commerce shape: hero with dual CTA + trust strip → three back-to-back "3-card grid, image-top, mono-eyebrow, arrow-link" sections (TodaysStockSection, WorkshopsSection, CafesSection all share the identical template) → dark CTA band → mega-footer. Worse, the photography actively works against specificity: one Unsplash asset (`photo-1511081692775-05d0f180a065`) is reused as the EntranceOverlay poster/video, the StorySection "roastery in early morning light" image, the WorkshopsSection "Cupping & Origin" card, and the CafesSection An Thuận (unbuilt) card — four different narrative claims wrapped around one stock frame. Two more asset IDs are each reused across two unrelated sections.

**Deterministic scan (Assessment B):** the bundled anti-pattern detector ran clean (0 findings) across all 15 target files — a real result, not a tool failure. Important caveat: the detector's page-level analyzers (`em-dash-overuse`, `marketing-buzzword`, `aphoristic-cadence`, etc.) structurally cannot run on `.tsx` component files (they require a full HTML document with `<!doctype>`/`<html>`/`<head>`), so the clean scan says nothing about copy-level patterns like em-dash usage, which does appear at least twice in the reviewed copy (StorySection, Footer). No false positives to report — the array was genuinely empty.

**Net:** the words are Bacama; the pictures and the grid are anyone's.

## Overall Impression

This is a well-sequenced, emotionally-intentional page let down by two things: reused stock photography that undercuts its own specific copy, and factual claims (three cafés, live roast dates, seat counts) that will visibly go stale or are already inaccurate. Fix those two and this becomes a genuinely distinctive small-batch storefront rather than a template with good writing.

## What's Working

1. **StorySection's family narrative** ("It began with my grandmother's pan" / "We opened the roastery in 2017 — one kitchen, one oven, one family outside Đà Nẵng.") is specific, unrepeatable copy tied to a real founding fact echoed consistently across Hero and Footer — the strongest evidence of design specificity on the page.
2. **Freshness-as-merchandising, not generic "Add to Cart."** The roast-date badge on the Hero image, ProductCard's sold-out overlay swapping to "Notify me," and per-café "today's roast" fields all translate the small-batch positioning into concrete UI rather than decoration.
3. **Numbered section rhythm + alternating light/dark bands** (01 · Today's stock → 05 · Order, with StorySection and CtaBandSection scoped dark) gives the single-scroll page an editorial, catalog-like structure well matched to the "paper & ink" identity.

## Priority Issues

**[P1] "Live" freshness data is entirely hardcoded and has no mechanism to stay true**

- **What:** Every signal that reads as real-time — AnnouncementBar's "Fresh bake · 05:14", Hero's "Roasted 11.08" badge, each café's `todaysRoast` field, and workshop `availability` strings like "3 seats left · 21–22 Sep" — is a static string in a constants array, with no backend or data-fetching library yet.
- **Why it matters:** A stock photo doesn't expire; a stale date or scarcity count actively becomes false — "Roasted 11.08" will still say that in December, "3 seats left" will still claim that after the class has passed. Directly contradicts the "honest, not faked" convention once anyone notices.
- **Fix:** Either wire these to a real, even minimally-edited, source with a visible "as of" timestamp, or reframe as timeless claims that can't go stale ("small daily batches" instead of a specific date; drop the countable seat number unless it reflects real checked inventory).
- **Suggested command:** `/impeccable harden`

**[P1] "Three cafés" overclaims a site that isn't open**

- **What:** Both the Hero eyebrow ("Three cafés · Đà Nẵng, Hội An") and CafesSection's heading ("Three cafés, one roastery") assert three cafés as present fact, while the third card (An Thuận) is explicitly `comingSoon` with "Opening · 09.2026" — rendered with identical visual weight to the two working locations. AnnouncementBar's own line ("Site 3 opens in September") is more honest than the headline copy next to it.
- **Why it matters:** A customer scanning quickly reads three operating locations today; this is a factual overclaim about a real physical business someone could plan a visit around.
- **Fix:** Change both headline instances to something like "Two cafés today, a third opening in Đà Nẵng this September," and visually differentiate the comingSoon card (dim treatment, a "Coming soon" ribbon on the image, not just a footer-row label).
- **Suggested command:** `/impeccable clarify`

**[P2] Same photo, four different stories**

- **What:** One Unsplash asset is reused as the EntranceOverlay poster/video, the StorySection image, the WorkshopsSection "Cupping & Origin" card, and the CafesSection An Thuận card — four unrelated captions around one frame. Two more asset IDs are each reused across two other unrelated sections.
- **Why it matters:** Combined with copy this specific (grandmother's pan, exact addresses, VND prices), reused stock photography reads as evasive rather than merely placeholder — the one place the design actively works against the specificity the copy earns.
- **Fix:** Source at minimum one distinct frame per section before real launch; short of that, stop pairing the identical image with materially different factual captions.
- **Suggested command:** `/impeccable adapt`

**[P2] One card concept, four inconsistent implementations**

- **What:** ProductCard (category label, swatches, freshness Badge, shared PriceTag) vs. the hand-rolled workshop teaser in TodaysStockSection (plain price, no badge) vs. WorkshopsSection's own hand-rolled cards (has a Badge) vs. CafesSection's cards (no price at all). Assessment B independently confirmed the pattern at the class-string level: the eyebrow-label class string (`text-primary font-mono text-xs tracking-widest uppercase`) is copy-pasted verbatim across 6 different files (8 occurrences), and the "see all / enroll" link style is copy-pasted across 3 files (5 occurrences) — concrete evidence these sections were built by copying a pattern rather than sharing one component.
- **Why it matters:** Users pattern-match on repeated shapes; unexplained differences in what information a "card" carries create low-grade inconsistency, and the copy-pasted classes mean a future token/style change has to be made in 6+ places by hand.
- **Fix:** Extract one shared teaser-card component (or extend ProductCard) so price/badge/link treatment agrees everywhere, and pull the repeated eyebrow-label / link-style class strings into a shared component or cva variant.
- **Suggested command:** `/impeccable distill`

**[P3] The close tapers into logistics instead of brand voice**

- **What:** CtaBandSection ends on payment-method logistics ("Pay with ZaloPay, MoMo, or cash on delivery...") then hands off directly to Footer's licence number and hours. The page's one closing brand-voice line ("Small roastery, daily batches, an early bake — Đà Nẵng, 2017") is buried in the footer's leftmost column rather than closing the CTA band.
- **Why it matters:** Per the peak-end rule, the retained impression is set by the ending — right now that's pure transaction, the opposite of the poetic open EntranceOverlay promised.
- **Fix:** Move a one-line brand beat to close CtaBandSection itself, before the payment-method row.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags

Selected per the Landing Page/Marketing row (Jordan, Riley, Casey), plus one project-specific persona derived from PRODUCT.md's two-audience Users section.

**Jordan (Confused First-Timer):** The "Coffee & Bakery" mega-menu lists Croissant, Kouign-amann, Carrot cake, and "Order a whole cake" as if distinct destinations, but all four link to the same generic `/shop` — Jordan clicks expecting a croissant page and lands on an undifferentiated catalog. "Three cafés, one roastery" reads as three open locations; nothing calls out that the third is 2026 opening unless reading closely.

**Riley (Deliberate Stress Tester):** Would spot the reused stock photo across four sections within minutes via view-source. Would flag "3 seats left · 21–22 Sep" as a static string with no system behind it — the exact same claim persists after the class date passes.

**Casey (Distracted Mobile User):** On first visit, three assets load with elevated priority simultaneously (EntranceOverlay's priority image, its autoplay video, Hero's own priority image) — heavy simultaneous load exactly when Casey is most likely on a spotty connection with no established intent to stay yet. EntranceOverlay's sessionStorage gate means no re-interruption on return, which is a genuine plus for Casey.

**"Mai," the Course-First Visitor (project-specific):** Wants to enroll in a course, no interest in buying beans today. The Hero's primary (solid) CTA is always "Shop the roast"; "Take a workshop" is always the secondary outline button, on every section that offers both. TodaysStockSection folds the Barista Foundations course card in alongside a coffee bag and a croissant under a shop/inventory metaphor that doesn't fit a course-enrollment decision. WorkshopsSection — the one section actually built for Mai — is section 03 of 5, so Mai scrolls through two shop-flavored sections before reaching anything addressed to her.

## Minor Observations

- AnnouncementBar isn't sticky, unlike Header, so the freshness/logistics ticker disappears after the first ~40px of scroll even though it's arguably the most "live-feeling" element on the page.
- CtaBandSection's payment list (ZaloPay, MoMo, VNPay QR, COD, Visa · MC, GHN) and Footer's payment list (ZaloPay · MoMo · VNPay · COD · GHN) don't match — Footer drops Visa · MC.
- Footer's `FOOTER_COLUMNS` array includes a Contact entry with `links: []` that's never rendered from that data — actual contact details are hardcoded separately in a bespoke branch, so the data model and the render don't agree for that column.
- EntranceOverlay's video has no visible close/X icon, only two text buttons at the bottom of a full-bleed screen — works, but easy to miss on a quick glance.
- EntranceOverlay's poster image correctly uses `alt=""` since it's a purely decorative backdrop behind an `aria-hidden` video — confirmed correct, not a violation.
- All 6 `<Image>` elements in scope have real alt text; no raw hex colors were found anywhere in scope (all color usage goes through semantic Tailwind tokens) — both clean.

## Questions to Consider

1. The homepage's entire freshness argument — roast dates, seat counts, "today's roast" per café — is hardcoded static copy with no backend behind it yet. What's the actual plan for keeping these true past day one, versus rewriting them to timeless claims that can't go stale?
2. If shop customers and course students are genuinely separate, not-cross-sold audiences, why does the only path into courses run through a shop-framed homepage where "Shop the roast" is always the solid, primary button and "Take a workshop" is always secondary?
3. Would the current scroll structure — three sections sharing one visual template, back to back — still make sense if the Cafés section only had one location instead of three, or is the template being kept full more because it's a template than because the content calls for it?
