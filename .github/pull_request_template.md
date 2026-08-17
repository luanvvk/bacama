# Description

Include a summary of the work done and the motivation behind it.

## Detailed PR Verification Procedure(s)

<!-- How did you verify this works? Steps to reproduce/test manually. -->

## Checklist

- [ ] **No breaking changes**: any API/contract changes are non-breaking, or callers were updated.
- [ ] **Tested**: new/changed behavior is covered by `pnpm test`.
- [ ] **Passes checks**: `pnpm lint`, `pnpm typecheck`, and `pnpm test` all pass locally.
- [ ] **Self-reviewed**: author has reviewed their own diff before requesting review.
- [ ] **Provider boundary respected**: if this PR touches payment/shipping/video/email/auth, no vendor SDK is imported and no vendor API called outside that vendor's own adapter under `src/lib/providers/<concern>/`. (Vendor names as display text or stored data are fine — see `docs/BUILD-PLAN.md` §3.1 for the check.)

## Security Checklist

- [ ] **Reviewed for security**: self-reviewed against the OWASP Top 10 and this repo's general security posture.
- [ ] **Rollback considered**: this change can be reverted or is backwards compatible if something goes wrong post-merge.

## Attachments

<!-- Screenshots / recordings for UI changes -->
