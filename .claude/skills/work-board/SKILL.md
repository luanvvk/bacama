---
name: work-board
description: Autonomous loop - pick the next ready GitHub issue, claim it, implement it via the /ship pipeline, open a PR into dev, wait for CI and review, merge, test the deployment in a real browser, file tickets for any bugs or improvements found, then continue. Use when the user says /work-board, "work the board", or "run the loop". Intended to be driven by /loop or the headless wrapper; one invocation handles one ticket.
---

One invocation = one ticket, start to finish. Repeat via `/loop` or
`.claude/scripts/agent-loop.mjs`. Rationale and safety model: `docs/AI-WORKFLOW.md`.

## Labels (the board's state machine)

`ai-ready` (human-approved for agents) → `agent-working` → closed.
Exits: `needs-human` (agent gave up or needs a decision), `blocked` (outside
account or another issue), `ready-to-merge` (green and reviewed, merge was not
permitted). Also: `proposed` (awaiting approval), `found-by-agent`, `bug`,
`ui`, `security-gate`, `size:S|M|L`.

## Cycle

1. **Pick** — `gh issue list --label ai-ready --state open --json number,title,labels,assignees,body`. Skip issues that are assigned, labelled `blocked`/`needs-human`, or whose body says `Blocked by #N` while #N is open. Take the lowest-numbered remaining one. **None left → stop the loop and report.**
2. **Size gate** — `size:L`, or no acceptance criteria: don't build. Label `needs-human`, comment what's missing or how to split it, move on to the next ticket.
3. **Claim** — assign yourself, swap `ai-ready` → `agent-working`, comment `Claimed by <machine/session>`. Re-read the issue; if another assignee appeared, back off.
4. **Build** — branch `feature/<issue#>-<slug>` from fresh `origin/dev`. If the session already runs in its own worktree (the headless wrapper does this), use it with `git switch -c`; otherwise create one. Run the `/ship` pipeline from the Plan step with the issue body as the spec. **Skip Gate 1 only for `size:S`**; for `size:M` the plan must stay inside the acceptance criteria, otherwise `needs-human`. Issues labelled `security-gate` (payments, webhooks, auth, roles) are built too, with extra review: `route-handler-auditor` and `reviewer` must both return PASS before the PR is merged, and the PR body must include a "Security Gate" section listing what the plan's section 8 requires (signature checks, amount re-read, role checks, no secrets in logs) and how each was verified. After merging, comment on the issue "Security Gate review recommended by the owner" and leave it closed by the PR.
5. **Prove it** — `pnpm typecheck`, `pnpm lint`, `pnpm test` green. Visible change (`ui` label, or the diff touches `src/app`/`src/components`): also Playwright locally with evidence (skill `ui-evidence`). New behaviour needs a test; a bug fix needs a test that failed before.
6. **PR** — push the feature branch; open a PR into **dev** via `/open-pr` with `Closes #N`, verification output, and evidence.
7. **Gate and merge** — `gh pr checks <n> --watch` until CI finishes. `reviewer` must return PASS on the final diff. Then `gh pr merge <n> --squash --delete-branch` (the guard hook allows this only for PRs into `dev` with every Actions check green; Lighthouse is advisory). Never merge into `staging`/`main`.
   If the merge is refused by a permission rule, that is not a failure: label the PR/issue `ready-to-merge`, comment "green and reviewed, waiting for a human to merge", and continue with step 8 against the PR's own preview deployment.
8. **Test the deployment** — find the deployment for the final commit (the merge commit on `dev`, or the PR head if unmerged):
   `gh api "repos/luanvvk/bacama/deployments?sha=<sha>"` → the entry whose `environment` contains `bacama-dev` → `.../deployments/<id>/statuses` → wait (poll, up to 10 minutes) for `success`, then take `environment_url`.
   - `curl -sIL <url>`: if it ends on `vercel.com/login`, the deployment is protected and `VERCEL_BYPASS_TOKEN` is missing. **Don't file bugs from a login page.** Comment once on the PR "deployment is behind Vercel protection; not tested (see #36)" and go to step 10.
   - Run the existing specs: `PW_BASE_URL=<url> pnpm exec playwright test -c playwright.remote.config.ts` (desktop and mobile).
   - Then drive the flow this ticket changed in a real browser, per `ui-evidence`: desktop and phone width, watch console errors and failed network requests, screenshot each state. Test both locales if text changed. Compare against the acceptance criteria and against what a customer would expect.
9. **File what you find** — for each real defect or worthwhile improvement, `gh issue create`:
   - Search open issues first (`gh issue list --search "<keywords>"`); comment on a duplicate instead of filing a new one.
   - Reproduce a defect a second time before filing. Max **3 new issues per cycle**.
   - Body: Context (URL, commit, ticket/PR it was found after), Steps to reproduce, Expected vs actual, Evidence (screenshot/GIF), Acceptance criteria, Out of scope. Labels always `found-by-agent`.
   - **Bug** (confirmed, size S/M, not security-related): labels `bug`, `size:*`, and `ai-ready` so the loop fixes it next. Do not set `ai-ready` if 5 or more `found-by-agent` issues are already open and `ai-ready`.
   - **Improvement, design opinion, or anything touching payments/auth/roles**: label `proposed` (the owner approves), never `ai-ready`.
   - Comment on the PR with a short list of what was tested and what was filed (links).
10. **Close out** — confirm the issue closed (or stays open with `ready-to-merge`), remove the worktree, `git pull` dev.

## Failure handling

- CI red: fix and push, max **2** rounds, then one model tier up (Opus for the build step) for 1 more, then give up.
- On giving up: label `needs-human`, remove `agent-working`, comment what was tried, leave the PR open as draft. Don't close the issue.
- **Stop the whole loop** after 3 consecutive failed tickets, or when the same test fails on `dev` itself (the base is broken: report it, don't paper over it).
- Never skip hooks, force-push, edit `.env*`, run migrations against the shared database, change CI or branch-protection settings (unless the issue itself is about a CI workflow file), or widen scope beyond the issue.
- Out-of-scope discoveries become **new issues** (step 9 rules), not extra changes in this PR.
