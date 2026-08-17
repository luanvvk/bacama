# Design Principles & Working Process

> **Audience:** the owner (solo developer) and any AI agent working on this repo.
> **Purpose:** the _reasoning_ behind [BUILD-PLAN.md](BUILD-PLAN.md). The build
> plan says what to do; this says how to decide, and how much to build.
> **Last updated:** 2026-08-17

---

## 1. What this project is actually optimising for

**Not scale.** Three cafés, one developer, a few thousand customers a year.
Postgres on a free tier will carry this entire business for years. Nothing here
will fall over from traffic.

The two things that actually matter:

1. **Changeability** — can one thing be altered without breaking three others?
2. **Reasoning about correctness** — can you tell whether the money code is right?

Projects this size don't die from load. They die because the developer can no
longer safely change anything, or because an order silently went wrong and
nobody noticed. Optimise for those two, ignore everything else.

**Corollary:** advice written for teams of 30 mostly does not apply here.
Microservices, event sourcing, CQRS, a message broker, Kubernetes — all solve
problems this project does not have, at a cost it cannot afford.

---

## 2. How to approach a new feature

The order matters. Steps 1–3 happen before any code.

**1. Find the nouns.** What things exist in the business? `Site`, `Product`,
`Order`, `Course`, `Enrollment`. Name them in business language, not framework
language. This step gets skipped most often and costs the most when skipped.

**2. Decide what you _don't_ own.** The highest-leverage step, and the
counterintuitive one — the value is in what you rule out. The POS owns in-store
sales. Grab owns cake delivery. Cloudflare owns video bytes. ZaloPay owns card
data. Every subsystem delegated is one you never write, debug, or secure.

> Heuristic: draw a box around what differentiates the business, buy or delegate
> everything else. Roasting coffee differentiates. Moving video bytes does not.

**3. Find the "hard middle."** In any app a small area is genuinely hard and the
rest is forms-over-data. Here it is exactly two things: **money** (orders,
payments, stock) and **access** (who may watch paid video, who may write admin
data). Everything else — the bakery form, the menu page — is CRUD that can be
written quickly and still be fine.

Inexperienced designs spread effort evenly. Good ones concentrate it. Spend the
care on webhooks and role checks; do not agonise over the announcement editor.

**4. Model the state transitions.** `OrderStatus` is not a label, it is a state
machine: `pending → paid → shipped → delivered`, with `awaiting_cod`, `failed`
and `refunded` as real branches. Writing the transitions out finds bugs before
code exists. "What if the webhook arrives twice?" produced `providerRef @unique`.
"What if it never arrives?" produced the 30-second timeout with an honest
"still processing" message instead of a fake success.

**5. Separate facts from views.** Store facts; compute everything else.
`roastDate` is a fact — "roasted 3 days ago" is a view of it. `Enrollment` is a
fact — "is a student" is a view of it. Every stored derived value is a second
source of truth, and it will drift from the first.

**6. Buy insurance only against changes you actually expect.** Provider
interfaces exist because payment providers genuinely will change. `siteId` is
everywhere because Site 3 opens in September 2026. Both are targeted bets on
named, likely events.

Deliberately _not_ built, because no such event is expected: a plugin system, a
CMS, a generic `Customer` entity, a separate backend service, a role hierarchy.
Flexibility you don't need is just complexity you pay for twice — once writing
it, again every time you read it.

---

## 3. The anatomy

Four layers, and one rule that makes them worth having.

```
src/app/**              pages, route handlers   ← never touches Prisma directly
src/components/**       UI
src/services/**         business rules          ← the only caller of Prisma
src/lib/prisma.ts       persistence
src/lib/providers/**    the outside world       ← only place a vendor name appears
src/stores/**           client-side state only
```

> **The rule: dependencies point one direction only.** A page may call a
> service. A service must never import a React component. Break this and there
> are no layers, only a knot.

**Where things go when you're unsure:**

| If it…                                       | it belongs in                 |
| -------------------------------------------- | ----------------------------- |
| talks to Postgres                            | `src/services/<feature>`      |
| talks to a third party                       | `src/lib/providers/<concern>` |
| is a pure transform with no I/O              | `src/lib/`                    |
| holds state across components in the browser | `src/stores/`                 |
| is HTTP-facing                               | `src/app/**/route.ts`         |

---

## 4. Ports and adapters — the one pattern worth knowing here

The provider setup is a named architecture: **ports and adapters** (also called
hexagonal architecture). Worth reading about, since this repo already uses it.

The idea: your own code defines the shape it wants to talk to (the **port** —
`PaymentProvider`, with `pay()`/`parseWebhook()`/`refund()`). A thin translation
layer per vendor implements that shape (the **adapter** — `zalopay.ts`).
Business logic never sees a vendor's shape, only its own.

Why it pays here specifically:

- **Swapping vendors is a new file, not a refactor.** Adding Stripe touches one file plus one line in a factory. Zero pages change.
- **The vendor's mess stays contained.** Webhook parsing, signature verification, odd field names, unit quirks — all inside the adapter.
- **You can start free.** Today's cheapest credible option and tomorrow's paid one reach the app through the same call.

The rule that makes it real, and the reason it's a merge-blocking check: **a
vendor's name appears in its own adapter file and nowhere else.** The moment a
page calls `zaloPay()` instead of `pay()`, the pattern is gone and you didn't
notice.

---

## 5. Two questions that catch most design mistakes

When unsure about a choice, ask these before writing code:

**"What is the source of truth for this?"**
If the answer is "two places," there is a bug waiting. This is what ruled out a
`SalesFact` table (the POS already owns those numbers) and what made `student` a
derived value instead of a role.

**"What happens if this fails halfway through?"**
Payment succeeds but shipment creation fails. Stock decrements but the order
write fails. Webhook arrives while the customer is still on the polling screen.
This question is what transactions and idempotency keys are for — and asking it
is how you find out you need them.

---

## 6. Scope discipline — how much to build

Solo developers overbuild because nobody says stop. These are the stops.

**Build a thin vertical slice before a wide horizontal layer.** One product, one
payment method, one order, one receipt — all the way through — before adding the
other five payment methods or converting the other twelve pages.

The goal here is **not** early revenue; the owner is building toward a complete
app and there is no cash-flow pressure (BUILD-PLAN.md §6.0). The reason to slice
is different and still compelling: a slice that runs end-to-end **surfaces
integration problems while there is still slack to absorb them.** A finished
data layer with no checkout has proved nothing. The same effort, sliced, proves
the whole path works.

**Cut features, never correctness.** Scope-cutting means fewer payment methods,
no admin UI yet, English-only for now. It never means skipping webhook signature
verification or shipping an unreviewed role check — and "it's only sandbox" is
not a reason to write the money path sloppily, because that code is what goes
live. Fewer things, each correct.

**Prefer manual over automated until the manual version actually hurts.** A
step a human does occasionally is a legitimate architecture, not technical debt.
Automate what is costing real time, not what feels unfinished.

**Distinguish "needed to work" from "needed to look finished."** Both eventually
ship here, but they are not the same priority, and confusing them is how three
features end up 80% done instead of one being finished.

**Timebox exploration; scope-box delivery.** For "I'm not sure how this works,"
give it a fixed time and accept whatever you learn. For "this must work," fix
the scope instead and let time vary. Never leave both open.

**When a task grows past one sitting, it was two tasks.** Split it and ship the
half that stands alone.

**Write the decision down where the next session will find it.** This is a hard
rule, not tidiness. Decisions live in `AGENTS.md` (conventions), `BUILD-PLAN.md`
§2 (architecture) and §9 (open questions). An undocumented decision gets
re-litigated by the next agent — that has already happened on this project more
than once, and each time it cost a session.

---

## 7. Working solo with AI agents

The real constraint is **not** how fast an agent produces code.

> **The bottleneck is how much code you can actually read and understand.**
> Code you merged without understanding is code you cannot maintain, and it is
> worse than not having it — it looks like progress while removing your ability
> to change direction.

Everything below follows from that.

**Batch work by reviewability, not by agent capacity.** An agent can happily
write 2,000 lines across 30 files. Ask instead for the smallest change that
stands alone, and actually read the diff. One reviewed PR beats five
rubber-stamped ones.

**Divide the labour by what's checkable.**

| Delegate freely (mechanical, verifiable)        | Own personally (judgement, hard to verify)         |
| ----------------------------------------------- | -------------------------------------------------- |
| CRUD forms, admin screens, tests, type plumbing | Whether it matches how the business actually works |
| Migrations, seed scripts, string extraction     | Vietnamese brand copy and tone                     |
| Refactors with tests already green              | Anything on the money or access path (§8 gates)    |
| Boilerplate, config, repetitive component work  | Visual design and what "good enough" means         |

**Give agents verifiable goals, not vague asks.** "Make the storefront use the
database" invites anything. "Replace `TodaysStockSection`'s `COURSES` import
with a `getFeaturedProducts` service; typecheck, lint and tests green" is
checkable. This is `AGENTS.md` principle 4, and it matters more with agents than
with people, because an agent will not tell you it guessed.

**Never let more than one thing be in flight.** Uncommitted work from an earlier
session has piled up on this project before. Finish, commit, branch, next.

**Fix a broken deploy the same day.** Deploy breakage compounds — a week of
commits on top of a red build means debugging a week of changes at once, alone.

**Spend model budget where judgement is needed.** Cheap models for mechanical
volume (tests, string extraction, form scaffolding); the strong ones for schema
design, security review, and anything on the money path. Budget is a resource
like time — allocate it, don't spread it evenly.

**Ask the agent to disagree with you.** An agent that only agrees is a very
expensive autocomplete. The role question in this repo caught a real
privilege-escalation problem in a document that had already been written and
committed — because it got challenged rather than implemented.

---

## 8. Traps to avoid

- **Designing for imagined scale** instead of expected change.
- **Splitting into services** before there is a reason. (Nearly happened here — see BUILD-PLAN.md D1.)
- **Generic abstractions with no second use case yet.** Two concrete implementations justify an interface; one does not, unless the second is already scheduled.
- **Storing derived data** — two sources of truth that drift.
- **Money code with no explicit state machine.**
- **Hidden UI mistaken for access control.** A button you didn't render is not a permission check; the route handler is.
- **Finishing the easy 80% of five features** instead of all of one.
- **Treating sandbox as an excuse for sloppy logic.** The code written against a sandbox is the code that goes live; only the credentials change.
- **Assuming the sandbox→production swap is free.** It isn't — see BUILD-PLAN.md §11.

---

## 9. Further reading

- **Ports & adapters / hexagonal architecture** — Alistair Cockburn's original write-up; the pattern `src/lib/providers/` implements.
- **Domain-Driven Design**, the light version — "find the nouns, name them in business language." Skip the enterprise machinery.
- **Walking skeleton / thin vertical slice** — Alistair Cockburn again; the idea behind the milestones in BUILD-PLAN.md §6.0.
- **The Twelve-Factor App** — mainly for config-in-environment, which is why secrets live in `.env` and Vercel env vars.
- **OWASP Top 10** — the PR template already references it; the two that matter most here are broken access control and injection.
