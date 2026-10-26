# AI Workflow — a small team, one developer

How we run Claude Code here like a normal squad while spending as few tokens as
possible. Solo project: three roles, two human gates, no board.

## Roles and models

| Role              | Agent / skill                                                  | Model  | Does                                                              |
| ----------------- | -------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| PM / orchestrator | main session (`/ship`, `/fix`)                                 | Sonnet | Coordinates, talks to you, keeps context small                    |
| Advisor           | `planner`, `reviewer`, `route-handler-auditor`                 | Opus   | Plans, reviews the diff, audits risky code                        |
| Builder           | `nextjs-component-builder`, `test-writer`, a11y/perf reviewers | Sonnet | Implements approved steps                                         |
| Runner            | `chore-runner`                                                 | Haiku  | Mechanical edits; runs typecheck/lint/test, reports only failures |
| Discovery         | `/grill-me`                                                    | Sonnet | Interviews you before planning                                    |

Opus only ever sees a narrow brief (a task, or a diff), so it stays cheap. The
main session never switches model mid-way (a switch loses the prompt cache).

## Flow

```
idea → /grill-me (if unclear) → planner → GATE 1 (you approve) → build (Sonnet)
     → verify (Haiku) → reviewer (Opus) → commit → GATE 2 (you merge)
```

- `/ship` — features and anything over ~3 files.
- `/fix "<bug>"` — small, understood bugs. Same pipeline minus the planner.
- **Gate 1:** you approve the plan. **Gate 2:** you merge. Agents never merge.

## Guardrails (enforced, not just requested)

`.claude/hooks/guard.mjs` + `.claude/settings.json` block: pushes to
`main`/`staging`/`dev`, force-push, `--no-verify`, `gh pr merge`, destructive
Prisma commands, `rm -rf` on broad targets, and reading or writing `.env*`.
`git reset --hard`, `git clean`, `git branch -D` ask first. Also protect the
branches on GitHub — that is the backstop if a hook is ever bypassed.

## Token rules

1. **Context in the repo, not the prompt** — `AGENTS.md`, `docs/BUILD-PLAN.md`, skills. Short prompts then work.
2. **Explained it twice? Make it a skill.**
3. **Plan before building**, and plan once: a clear spec lets one session run for hours unattended.
4. **Delegate searching/test runs** to subagents; the main session keeps only the answer.
5. **One workstream = one session = one worktree.** Don't compact or switch model mid-task; when the task merges, end the session and start fresh.
6. **Medium effort** by default; raise it only for the planner on hard problems.
7. **Cap retries:** two fix rounds, then escalate (one model tier up, then you).
8. **Make the AI report** what it changed and why; ask "why did you do that?" about anything surprising; tell it "nothing beyond the request".

## Parallel work and remote control

```powershell
# one worktree + branch per task (see AGENTS.md "Branches")
claude --worktree <task-name>
# a session you can steer from the Claude mobile app
claude --remote-control "Bacama <task-name>"
```

Each new worktree needs `.env` copied in and `pnpm install`. Run a second dev
server with `pnpm dev -p 3001`. Review and merge PRs from the phone.

## Running the board loop

Tickets live in GitHub Issues and the Bacama project board. Labels are the
state: `proposed` → (you approve) `ai-ready` → `agent-working` → closed, with
`needs-human` and `blocked` as exits. Agents only ever take `ai-ready`.

```powershell
# keep the agents-branch .env OUTSIDE the repo, e.g. D:\bacama-wt\agents.env
node .claude/scripts/agent-loop.mjs --env-file D:\bacama-wt\agents.env --dry-run
node .claude/scripts/agent-loop.mjs --env-file D:\bacama-wt\agents.env --cycles 3 --cycle-budget 5 --total-budget 15
```

After a PR merges, the cycle waits for the Vercel deployment of that commit,
runs `tests/e2e` against it (`playwright.remote.config.ts`) and drives the
changed flow in a browser, then files tickets for what it finds: confirmed
bugs as `bug` + `ai-ready` (capped at 3 per cycle and 5 open at once),
improvements as `proposed` for you to approve. Previews are behind Vercel's
login wall, so put `VERCEL_BYPASS_TOKEN=<token>` (Project > Settings >
Deployment Protection > Protection Bypass for Automation) in the agents env
file. Without it the cycle skips deployment testing instead of filing bugs.

Each cycle: fresh worktree from `origin/dev`, one `claude -p` session on one
ticket, logs in `..\bacama-wt\_logs`. It makes no model call when nothing is
`ai-ready`, refuses an env file whose database user isn't `agents`, refuses a
worktree without the guard hook, and stops after two failed cycles in a row
or when the budget is spent. Payment/auth tickets (`security-gate`) run too,
with `reviewer` and `route-handler-auditor` both required to PASS and a
Security Gate section in the PR. BUILD-PLAN section 8 still expects the owner
to review those areas; the loop only flags them.

## Review focus (human)

AI reviews first. You read closely where it flags something large, and always
for: algorithm/logic, security, performance, and anything the AI added beyond
the request (including tests it wrote for itself).

## Later, if the load justifies it

GitHub Issues as a work queue (label `ai`, one session claims a ticket), a
`/deploy` skill with a human gate before production, and a `/report` skill for
token and cost summaries. Not built yet — don't add speculatively.
