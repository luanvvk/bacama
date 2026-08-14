---
name: conventions
description: Coding conventions for this repo — naming, file layout, component/hook/service patterns, and the comments policy. Read before writing or reviewing any code under src/**.
---

# Coding Conventions

- **Formatting, imports, `console.log`, `any`:** enforced live by ESLint + Prettier (`eslint.config.mjs`, `.prettierrc.json`) and auto-fixed by the pre-commit hook — run `pnpm lint` on changed files before finishing rather than checking against a restated list here.
- **File layout:**
  - Pages/routes: `src/app/**` (App Router; route groups use `(parentheses)`)
  - Reusable UI primitives (shadcn/ui + custom): `src/components/ui/`
  - Controlled form fields (`ControlledInput`, `ControlledSelect`, ...): `src/components/form/` — see [patterns/form.md](./patterns/form.md)
  - Zustand stores: colocated with the feature they belong to (e.g. `src/stores/cart.ts`) — see [patterns/zustand-store.md](./patterns/zustand-store.md)
  - Zod schemas: colocated with the form/service that uses them, or `src/lib/schemas/` if shared — see [patterns/zod-schema.md](./patterns/zod-schema.md)
  - Feature/layout components: `src/components/<Area>/` — check `src/components/` before adding a new area
  - Hooks: `src/hooks/`
  - API clients / data access: `src/services/`
  - Shared utilities: `src/lib/`
  - Constants: `src/constants/`
  - Shared types: `src/types/`, or colocated with the feature that owns them
  - Global styles / Tailwind theme: `src/app/globals.css` (Tailwind v4 is configured via `@theme` in CSS, not `tailwind.config.js`)
- **File naming:**
  - Every component gets its own folder, named `PascalCase` after the component, with the component itself in `index.tsx` and its test(s) in a `__tests__/` subfolder — e.g. `src/components/ui/Button/index.tsx` + `src/components/ui/Button/__tests__/Button.test.tsx`. This applies everywhere components live (`src/components/ui/`, `src/components/<Area>/`). Import by folder name (`@/components/ui/Button`) — module resolution finds `index.tsx` automatically, no `/index` suffix needed.
  - `src/components/ui/index.ts` is a barrel that re-exports every component in that folder (`export * from './Button'`, etc.) — add the new line whenever a component is added.
  - This project intentionally restructures shadcn/ui's generated `kebab-case.tsx` files into this folder-per-component shape after every `pnpm dlx shadcn add <name>` — do that restructure (and fix the resulting imports) as part of adding a component, not as a separate cleanup step.
  - Utilities, constants, types: `kebab-case.ts` (`format-price.ts`, `query-keys.ts`).
  - Hooks: `camelCase.ts` matching the hook name (`useMediaQuery.ts`).
- **Components:** arrow functions only, never `function Name() {}`. Either `export const Name = (props) => ...` directly, or `const Name = (props) => ...` with a single `export { Name, otherThing }` at the bottom of the file (shadcn's own convention — keep it when editing shadcn-generated files). Never an unnamed/inline arrow function as a default export. Use an implicit-return arrow body when the component is pure prop-in/JSX-out; only drop to a block body with an explicit `return` when a hook call, derived value, or early-return guard has to run first — see [patterns/component.md](./patterns/component.md). If a component forwards a ref (`forwardRef`), always set `Component.displayName = 'Component'` right after it — devtools and error stacks can't infer a name from an anonymous forwardRef callback.
- **Variants:** when a component has more than 2-3 visual variants, use `class-variance-authority` (`cva`) rather than branching template strings — see [patterns/component-variants.md](./patterns/component-variants.md).
- **Styling:** Tailwind first, composed via the `cn()` helper (`src/lib/utils.ts`, `clsx` + `tailwind-merge`) so conditional/override classes merge correctly. Let `prettier-plugin-tailwindcss` sort class lists — don't hand-sort.
  - Prefer Tailwind's native scale (`rounded-lg`, `text-xs`, `tracking-widest`, `p-3`) over an arbitrary-value class (`rounded-[3px]`, `text-[13.5px]`, `p-[12px]`) — pick the closest native step rather than hand-matching a design file's exact pixel value. A design mockup is a reference, not a spec to reproduce pixel-for-pixel.
  - Never hardcode a color (`bg-[#96521F]`, `text-[#1E1A17]`) in a className. Define it as a CSS variable in `src/app/globals.css` (`:root` / `.dark`) and expose it through `@theme inline` as a `--color-*` token, then reference it by semantic name (`bg-primary`, `text-ink-faint`). This keeps theming (including dark-scoped sections) working from one place instead of scattered literals.
- **Client vs. server components:** default to server components; add `'use client'` only when the component actually needs state, effects, browser APIs, or event handlers.
- **Data/services:** any function that talks to an external API or backend lives in `src/services/<feature>/`, not inline in a component — see [patterns/service.md](./patterns/service.md).
- **Hooks:** shared stateful logic used by 2+ components goes in `src/hooks/`, named `use*` — see [patterns/hook.md](./patterns/hook.md).
- **Forms:** always `react-hook-form` + a `zod` schema via `zodResolver`. Build the field UI from `src/components/form/Controlled*` components (`ControlledInput`, `ControlledSelect`, `ControlledTextarea`, `ControlledCheckbox`) rather than wiring `Controller` inline in a page/feature component — see [patterns/form.md](./patterns/form.md). Don't roll custom validation when a zod schema can express it.
- **Client state shared across components:** Zustand (`src/stores/`). Local, single-component state stays `useState`. Don't introduce a Context when a prop or a Zustand selector would do — see [patterns/zustand-store.md](./patterns/zustand-store.md).

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
- [patterns/form.md](./patterns/form.md) — `react-hook-form` + zod forms built from `Controlled*` components
- [patterns/zod-schema.md](./patterns/zod-schema.md) — zod schemas and inferred types
- [patterns/zustand-store.md](./patterns/zustand-store.md) — `use*Store.ts` Zustand stores

These are a living reference — update the relevant doc (not just the code)
whenever a pattern changes materially, so the sample doesn't drift from what
new code should actually look like. Add a new pattern doc here (and link it
above) once a library decision lands (state management, forms, auth, etc.)
rather than improvising ad hoc.
