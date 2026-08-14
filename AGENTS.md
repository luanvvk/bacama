<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bacama — Agent Rules

This file is the single source of truth for AI coding agents on this repo,
regardless of tool (Claude Code, Cursor, GitHub Copilot, Windsurf, Codex CLI,
Aider, etc. all discover `AGENTS.md` natively). `CLAUDE.md` just imports this
file (`@AGENTS.md`) — don't duplicate rules there.

## Project overview

Bacama is a bakery & online-courses e-commerce platform: a public shop
(product catalog, cart, checkout), a courses/learning area, and an admin
back office (catalog, orders, shipments, staff, students, announcements).
The original static HTML/CSS design mockups live on the
`feature/design-mockups` branch under `design/` — use them as the visual
reference when building the equivalent React pages, but don't copy their
markup verbatim (no Tailwind classes, no component structure).

## Branches

- `main` — stable/production, protected. Only receives merges from `staging`.
- `staging` — pre-production validation.
- `dev` — active development. Feature branches fork from and merge back here.
- `feature/design-mockups` — frozen; holds the original static mockups.

## Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Components:** [shadcn/ui](https://ui.shadcn.com) (Radix-based, `components.json`) for interactive primitives (Button, Dialog, Select, DropdownMenu, Sheet, Tabs, Card, Avatar, Badge, Breadcrumb, Toaster, ...), plus custom primitives with no shadcn equivalent (`Typography` — `Heading`/`Text`, `Rating`) — all under `src/components/ui/<PascalName>/index.tsx`, barrel-exported from `src/components/ui/index.ts`. See `.claude/skills/conventions/patterns/component-variants.md` for the exact workflow to add a new one.
- **Styling:** Tailwind CSS v4 (CSS-first config in `src/app/globals.css`, no `tailwind.config.js`) with the brand's "paper & ink" design tokens as CSS variables (`--primary`, `--success`, `--ink-faint`, etc.) — see `globals.css` `:root`/`.dark`. `class-variance-authority` for variant components, `clsx` + `tailwind-merge` via the `cn()` helper in `src/lib/utils.ts`.
- **Fonts:** Fraunces (`--font-heading`, display/serif) + Be Vietnam Pro (`--font-sans`, body), loaded via `next/font/google` in `src/app/layout.tsx`.
- **Toasts:** `sonner`, wrapped by `src/lib/toast.ts` (`import { toast } from '@/lib/toast'`) — don't import `sonner` directly in feature code.
- **Client state shared across components:** Zustand, one store per domain concept under `src/stores/` (e.g. `src/stores/cart.ts`). Local, single-component state stays `useState`. See `.claude/skills/conventions/patterns/zustand-store.md`.
- **Forms:** `react-hook-form` + `zod` via `@hookform/resolvers/zod`, built from the `Controlled*` components in `src/components/form/` (`ControlledInput`, `ControlledSelect`, `ControlledTextarea`, `ControlledCheckbox`) — don't wire `Controller` directly in a page. See `.claude/skills/conventions/patterns/form.md` and `patterns/zod-schema.md`.
- **Testing:** Jest + React Testing Library (`pnpm test`, `pnpm test:watch`, `pnpm test:coverage`) — `jest.setup.ts` polyfills the browser APIs Radix primitives need in jsdom (`hasPointerCapture`, `scrollIntoView`, `ResizeObserver`).
- **Package manager:** pnpm (`packageManager` field + `.npmrc engine-strict=true` — don't use npm/yarn commands or lockfiles)
- **Linting/formatting:** ESLint (flat config, `eslint-config-next` + `eslint-config-prettier`), Prettier (`prettier-plugin-tailwindcss` sorts classes — don't hand-sort)

No data-fetching library or auth library is chosen yet. **Don't add one
speculatively.** When a task needs one, ask, then add it here once decided
so future agents don't re-litigate the choice.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` — Jest

A pre-commit hook (husky + lint-staged) already runs `eslint --fix` and
`prettier --write` on staged `.ts/.tsx/.js/.jsx`, and `prettier --write` on
staged `.json/.css/.md` — no need to hand-run formatting the hook will redo.
Commit messages are linted by commitlint (`@commitlint/config-conventional`)
via the `commit-msg` hook — use Conventional Commits (`feat:`, `fix:`,
`chore:`, etc.).

## What to do before saying a task is done

1. `pnpm typecheck` — must pass
2. `pnpm lint` on changed files — must pass (0 errors; warnings OK unless trivial)
3. `pnpm test` — must pass for any touched component/hook/util with existing or new tests
4. For UI work, state explicitly that you have not verified the UI in a browser unless you actually have.

## What NOT to do

- Don't add dependencies without asking — especially a state/data/form/auth library (see Stack above).
- Don't create new top-level `src/` folders without asking.
- Don't mass-refactor unrelated code during a feature or bug fix.
- Don't add backward-compat shims, feature flags, or defensive checks for scenarios that can't happen.
- Don't edit `pnpm-lock.yaml` by hand.
- Don't copy markup/classes from the `design/` mockups verbatim — they're a visual reference, not source.

## Conventions

All coding conventions (naming, file layout, component/hook/service patterns,
comments policy) are defined in the `conventions` skill
([.claude/skills/conventions/SKILL.md](.claude/skills/conventions/SKILL.md)).
Read it before writing or reviewing code under `src/**`.

## Additional reference files

| File                                                                         | Covers                                                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [.claude/skills/conventions/SKILL.md](.claude/skills/conventions/SKILL.md)   | Coding conventions (naming, file layout, component/hook/service patterns, comments policy)                 |
| [.claude/skills/conventions/patterns/](.claude/skills/conventions/patterns/) | Annotated per-pattern reference docs                                                                       |
| [.claude/skills/open-pr/SKILL.md](.claude/skills/open-pr/SKILL.md)           | `/open-pr` — PR template and checklist rules                                                               |
| [.claude/agents/](.claude/agents/)                                           | Subagent definitions — delegate matching tasks via the Agent tool instead of duplicating their work inline |
