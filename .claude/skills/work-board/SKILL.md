---
name: work-board
description: Autonomous loop - pick the next ready GitHub issue, claim it, implement it via the /ship pipeline, open a PR into dev, wait for CI and review, merge, then continue. Use when the user says /work-board, "work the board", or "run the loop". Intended to be driven by /loop or a headless wrapper; one invocation handles one ticket.
---

One invocation = one ticket, start to finish. Repeat via `/loop` or the
headless wrapper. Rationale and safety model: `docs/AI-WORKFLOW.md`.

## Labels (the board's state machine)

`ai-ready` (human-approved for agents) → `agent-working` → merged/closed.
Escape hatches: `needs-human` (agent gave up or needs a decision), `blocked`
(waiting on an external account or another issue). Size: `size:S` / `size:M` /
`size:L`. Optional: `ui` (needs browser evidence), `bug`, `phase:N`.

## Cycle

1. **Pick** — `gh issue list --label ai-ready --state open --json number,title,labels,assignees,body`. Skip issues that are assigned, labelled `blocked`/`needs-human`, or whose body says `Blocked by #N` while #N is open. Take the lowest-numbered remaining one. **None left → stop the loop and report.**
2. **Size gate** — `size:L`, or no acceptance criteria in the body: don't build. Label `needs-human`, comment what's missing or how to split it, stop this cycle (continue to next ticket).
3. **Claim** — assign yourself, swap `ai-ready` → `agent-working`, comment `Claimed by <machine/session>`. Re-read the issue; if another assignee appeared, back off.
4. **Build** — branch `feature/<issue#>-<slug>` from fresh `origin/dev`. If the session already runs in its own worktree (the headless wrapper does this), use it with `git switch -c`; otherwise create one. Run the `/ship` pipeline from the Plan step, with the issue body as the spec. **Skip Gate 1 only for `size:S`**; for `size:M` the planner's plan must stay inside the issue's acceptance criteria — if it needs more, `needs-human`.
5. **Prove it** — `pnpm typecheck`, `pnpm lint`, `pnpm test` green. If the issue has label `ui` or the diff touches `src/app`/`src/components`, also run Playwright and attach evidence (skill `ui-evidence`). New behaviour needs a test; a bug fix needs a test that failed before.
6. **PR** — push the feature branch; open a PR into **dev** via `/open-pr` with `Closes #N`, verification output, and evidence.
7. **Gate** — `gh pr checks <n> --watch` until CI finishes. The `reviewer` agent must return PASS on the final diff. Both → `gh pr merge <n> --squash --delete-branch` (the guard hook only allows this for PRs into `dev` with all checks green). Never merge into `staging`/`main`.
8. **Close out** — confirm the issue closed, remove the worktree, `git pull` dev.

## Failure handling

- CI red: fix and push, max **2** rounds, then one model tier up (Opus for the build step) for 1 more, then give up.
- On giving up: label `needs-human`, remove `agent-working`, comment what was tried and where it's stuck, leave the PR open as draft. Don't close the issue.
- **Stop the whole loop** after 3 consecutive failed tickets, or if the same test fails on `dev` itself (the base is broken — report it, don't paper over it).
- Never skip hooks, force-push, edit `.env*`, run migrations against the shared database, or widen scope beyond the issue.
- Out-of-scope discoveries become **new issues** (label `needs-human`), not extra changes in this PR.
