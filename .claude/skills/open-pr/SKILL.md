---
name: open-pr
description: Open a pull request following the repo's template and checklist conventions
---

Follow all the rules below when opening a pull request.

## Template

Read `.github/pull_request_template.md` first and use it as the exact
structure for the PR description — keep all its headings/sections and fill
each one in based on the actual changes. Don't remove or rename sections,
and don't leave placeholder text unfilled.

Remove any HTML comment instructions (e.g. `<!-- like this -->`) from the
final PR body — those are guidance for the author, not part of the output.

## Checklist items

For checklist items, check off (`[x]`) only the ones that are actually true
based on the change. Don't check items you can't verify (like "tested on
staging") — leave those unchecked (`[ ]`) rather than assuming.

## Branch naming and PR title

Branches follow `<type>/<slug>`, where `<type>` is a Conventional Commits
type (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`) and
`<slug>` is a short kebab-case description (e.g. `feat/checkout-stripe-flow`).

Derive the PR title from the branch name and the actual diff, in
Conventional Commits form: `<type>: <sentence-case summary>`. Example:
branch `feat/checkout-stripe-flow` → PR title `feat: add Stripe checkout flow`.
If the branch doesn't follow the `<type>/<slug>` pattern, infer the type
from the diff instead of guessing at a missing prefix.

## Base branch

Target `dev` unless the user says otherwise — `staging` and `main` only
receive merges from the branch below them (see `AGENTS.md` → Branches).
