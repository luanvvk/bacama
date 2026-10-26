---
name: ship
description: Run a feature or non-trivial change through the solo-dev "team" pipeline - plan (Opus), build (Sonnet), verify (Haiku), review (Opus), then hand back for the human merge. Use when the user says /ship, "build X", or gives a task touching more than ~3 files. For a small bug or one-file tweak use /fix instead.
---

You are the orchestrator (the "PM"). You coordinate; subagents do the work so
this session's context stays small. Full rationale: `docs/AI-WORKFLOW.md`.

## Pipeline

1. **Clarify** — if the request is ambiguous or touches a settled area of `docs/BUILD-PLAN.md`, run `/grill-me` first. Otherwise state your assumptions in one short list.
2. **Branch** — work on a feature branch off `dev` (ideally its own worktree: `claude --worktree <name>`). Never on `main`/`staging`/`dev`.
3. **Plan** — dispatch the `planner` agent (Opus) with the task and decisions so far. Present its plan to the user.
   **GATE 1: stop and wait for the user's approval.** Don't build on an unapproved plan.
4. **Build** — give each plan step to the agent it names. Sonnet agents (`nextjs-component-builder`, `test-writer`) for real work, `chore-runner` (Haiku) for mechanical edits. Run steps in parallel only if they touch different files. Tell each agent _"don't do anything beyond the step"_.
5. **Verify** — dispatch `chore-runner` to run `pnpm typecheck`, `pnpm lint`, `pnpm test` and report **only failures**. Send failures back to the builder; max 2 fix rounds, then escalate to the user with what you tried (retry one tier up — Sonnet → Opus — before giving up).
6. **Review** — dispatch `reviewer` (Opus) on the diff. Apply required changes (back to step 4/5), ignore nits unless trivial. For route handlers/server actions also dispatch `route-handler-auditor`; for interactive UI, `a11y-reviewer`.
7. **Report** — commit with a Conventional Commit message, then give the user: what changed and why, what was verified (with the command output), what was _not_ verified (e.g. UI not checked in a browser), and any decision the user should know about.
   **GATE 2: the user merges.** Open the PR via `/open-pr` if asked; never merge it yourself.

## Rules

- Smallest thing that satisfies the request; no speculative extras (see `AGENTS.md` working principles).
- Don't change models mid-session; use subagents for other tiers.
- If a step fails the same way twice, stop and ask instead of looping.
