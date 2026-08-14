# Bacama

Bacama is a bakery & courses e-commerce platform (shop, checkout, courses, and admin management).

## Branches

- `main` — stable/production. Kept clean; only merges from `staging` land here.
- `staging` — pre-production, mirrors `main` until a release is validated.
- `dev` — active development branch. All new work happens here (or in feature branches off it).
- `feature/design-mockups` — original static HTML/CSS/JS design mockups, preserved under [`design/`](../feature/design-mockups/design/) for reference during implementation.

## Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS v4, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Testing:** Jest + React Testing Library
- **Tooling:** ESLint, Prettier, Husky, lint-staged, commitlint

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Commands

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint
- `pnpm typecheck` — run the TypeScript compiler with no emit
- `pnpm format` — format the codebase with Prettier
- `pnpm test` — run the Jest test suite
