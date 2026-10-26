---
name: fix
description: Quick lane for a small, well-understood bug or one/two-file tweak - skips planning and goes straight to fix, verify, review. Use when the user says /fix "<bug>" or the change is clearly small. If it grows past ~3 files or needs design decisions, switch to /ship.
---

1. **Reproduce first** — find the cause; if it's testable, write a failing test (`test-writer`, Sonnet) before the fix.
2. **Fix** — minimal change, on a feature branch (never `main`/`staging`/`dev`). Mechanical parts may go to `chore-runner` (Haiku).
3. **Verify** — `chore-runner` runs `pnpm typecheck`, `pnpm lint`, `pnpm test`, reports only failures.
4. **Review** — `reviewer` (Opus) on the diff. Skip only for typo/copy-only changes.
5. **Report** — Conventional Commit (`fix: ...`), then tell the user: root cause in one sentence, what was verified, what wasn't. The user merges; never run `gh pr merge`.

If the root cause turns out to be bigger than expected, stop and say so instead of widening scope.
