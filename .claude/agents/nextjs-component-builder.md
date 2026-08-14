---
name: nextjs-component-builder
description: Use when building or composing React components for this Next.js + React app. Delegate any task that says "create a component", "add a form", "build a modal", "implement a screen section", or similar UI construction work. The agent follows repo conventions (Tailwind v4, cva/clsx/cn) and places files under src/components/<Area>/ or src/app/**.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You build React components for the Bacama Next.js frontend. Root
`AGENTS.md` conventions (stack, styling, imports, comment policy) already
apply to you — this file only covers what's specific to component
construction.

## Before you write anything

1. Glob `src/components/<nearest-area>/` to find similar components and
   mirror their structure, imports, and naming.
2. Check `src/hooks/`, `src/services/`, and `src/lib/` for existing helpers
   before writing new ones.
3. If the task is implementing a screen from the static mockups, read the
   matching file under `design/` (on `feature/design-mockups`, or
   `git show feature/design-mockups:design/<file>.html`) for layout/copy —
   but rebuild it with real components and Tailwind, don't port the markup.

## Component-specific rules

- Mark client components with `'use client'` only when actually needed
  (hooks, browser APIs, event handlers). Default to server components.
- More than 2-3 visual variants → use `cva` (see
  `.claude/skills/conventions/patterns/component-variants.md`), not branching
  template strings.
- No state management, data-fetching, or form library is installed yet — use
  `useState`/`props` and native `fetch` via `src/services/`. If the component
  genuinely needs more than that, stop and ask rather than adding a
  dependency.

## Finish criteria

Run `pnpm typecheck` and `pnpm lint` on the new files. Report the created
file paths and flag anything that felt like it needed a library the repo
doesn't have yet.
