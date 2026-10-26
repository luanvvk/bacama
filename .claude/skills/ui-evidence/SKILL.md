---
name: ui-evidence
description: Capture before/after proof of a UI change or UI bug with Playwright - screenshots and a short GIF - and attach it to the PR or issue. Use for any ticket labelled `ui`, any diff touching src/app or src/components, or when asked to "show", "record", or "reproduce" a UI bug.
---

Evidence is for the reviewer: they should see the change without running it.

## Steps

1. **Start the app** against the dev server (`pnpm dev --hostname 127.0.0.1`); Playwright's `webServer` in `playwright.config.ts` already does this. Use desktop **and** mobile projects for layout changes.
2. **Drive the real flow** with a throwaway spec under `tests/e2e/` (or the real spec if you're adding one). Record with `use: { video: 'on', screenshot: 'on' }` via CLI flags or a `test.use` block. Also fail on `console.error` and failed network requests.
3. **Before/after for bugs:** capture the broken state on `origin/dev` first (use a second worktree or `git stash`), then after the fix. A bug fix without a "before" isn't evidence.
4. **GIF:** `node .claude/skills/ui-evidence/to-gif.mjs <video.webm> <out.gif> [fps=8] [width=720]`. Keep GIFs short (<15 s) and under ~5 MB.
5. **Attach:**
   - PR/issue body: GitHub can't take file uploads via the CLI, so commit evidence to a branch `evidence/<issue#>` under `evidence/<issue#>/` (never to `dev`) and reference it with `raw.githubusercontent.com` image links; or publish an Artifact (one page: summary, before/after screenshots, GIF as data URI) and link it in the PR.
   - Always include the one-line verdict: what you checked, what you did **not** check.
6. Delete the temporary spec if it isn't a real regression test. Real regression tests stay and are named for the behaviour.

## Don't

- Don't screenshot pages with real customer data. The seeded database holds real business data: use fixtures or the guest/mock flows.
- Don't add Playwright config or dependencies without asking; the repo already has `@playwright/test`, a desktop and a mobile project.
