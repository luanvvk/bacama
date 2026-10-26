---
name: grill-me
description: Interview the user about a feature or change before planning it, so nothing is silently assumed. Use when the user says "grill me", or before /ship on anything ambiguous or touching a settled area of docs/BUILD-PLAN.md.
---

Goal: remove every silent assumption before any plan or code exists.

1. **Look up facts yourself first** — read `AGENTS.md`, `docs/BUILD-PLAN.md`, and the relevant code. Only ask the user about _decisions_, never about things the repo can answer.
2. **Ask in rounds of 3–5 questions.** Each question gets your recommended answer, marked so the user can reply "ok" to accept. Format:

   > **Q1** <question>
   > ➡️ Recommended: <answer + one-line reason>

3. Prioritise questions that change the plan: scope boundaries, data model, auth/security, error and empty states, what is explicitly _out_ of scope.
4. Stop when the last round produced no new decisions. Then output a **Decisions** list (decision + reason + rejected alternative) — this is what `/ship` and the planner consume. If a decision is architectural, offer to record it in `docs/BUILD-PLAN.md`.

Don't plan or code in this skill. Don't ask more than ~3 rounds without checking the user still wants to continue.
