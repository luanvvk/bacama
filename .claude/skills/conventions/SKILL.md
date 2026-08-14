---
name: conventions
description: Coding conventions for this repo — naming, file layout, component/hook/service patterns, and the comments policy. Read before writing or reviewing any code under src/**.
---

# Coding Conventions

- **Formatting, imports, `console.log`, `any`:** enforced live by ESLint + Prettier (`eslint.config.mjs`, `.prettierrc.json`) and auto-fixed by the pre-commit hook — run `pnpm lint` on changed files before finishing rather than checking against a restated list here.
- **File layout:**
  - Pages/routes: `src/app/**` (App Router; route groups use `(parentheses)`)
  - Reusable UI primitives: `src/components/ui/`
  - Feature/layout components: `src/components/<Area>/` — check `src/components/` before adding a new area
  - Hooks: `src/hooks/`
  - API clients / data access: `src/services/`
  - Shared utilities: `src/lib/`
  - Constants: `src/constants/`
  - Shared types: `src/types/`, or colocated with the feature that owns them
  - Global styles / Tailwind theme: `src/app/globals.css` (Tailwind v4 is configured via `@theme` in CSS, not `tailwind.config.js`)
- **Components:** function components, named exports (`export const X = (props) => ...`). Use an implicit-return arrow body when the component is pure prop-in/JSX-out; only drop to a block body with an explicit `return` when a hook call, derived value, or early-return guard has to run first — see [patterns/component.md](./patterns/component.md).
- **Variants:** when a component has more than 2-3 visual variants, use `class-variance-authority` (`cva`) rather than branching template strings — see [patterns/component-variants.md](./patterns/component-variants.md).
- **Styling:** Tailwind first, composed via the `cn()` helper (`src/lib/utils.ts`, `clsx` + `tailwind-merge`) so conditional/override classes merge correctly. Let `prettier-plugin-tailwindcss` sort class lists — don't hand-sort.
- **Client vs. server components:** default to server components; add `'use client'` only when the component actually needs state, effects, browser APIs, or event handlers.
- **Data/services:** any function that talks to an external API or backend lives in `src/services/<feature>/`, not inline in a component — see [patterns/service.md](./patterns/service.md).
- **Hooks:** shared stateful logic used by 2+ components goes in `src/hooks/`, named `use*` — see [patterns/hook.md](./patterns/hook.md).

## Comments

- Default: **do not write comments.**
- Only comment the **why** when it is non-obvious: a hidden constraint, a workaround for a specific bug, a subtle invariant, or behavior that would surprise a reader.
- Never write WHAT-comments — good names and types already say what the code does.
- Never reference the current task, PR, or ticket in code comments — that belongs in the commit message / PR description.
- No multi-paragraph docstrings. One short line is the ceiling.
- Do not leave `// TODO` / `// FIXME` unless the user asks.

## Detailed pattern references

Each of the following is a standalone doc with an annotated code sample and a
rules checklist for that pattern. They're scoped by concern, so only the
relevant one(s) load for the file you're editing:

- [patterns/component.md](./patterns/component.md) — plain function component
- [patterns/component-variants.md](./patterns/component-variants.md) — `cva`-based variant components
- [patterns/hook.md](./patterns/hook.md) — custom hooks
- [patterns/service.md](./patterns/service.md) — `src/services/<feature>/` data-access modules

These are a living reference — update the relevant doc (not just the code)
whenever a pattern changes materially, so the sample doesn't drift from what
new code should actually look like. Add a new pattern doc here (and link it
above) once a library decision lands (state management, forms, auth, etc.)
rather than improvising ad hoc.
