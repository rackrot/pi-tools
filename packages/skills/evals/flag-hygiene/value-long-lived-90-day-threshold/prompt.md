---
name: value-long-lived-90-day-threshold
description: Value case. Which flags count as long-lived temporary flags. The 90-day threshold applies only when no expiry is set; a flag past its own expiry gets the finding whatever its age, and one with an expiry still ahead does not. The bare model applies 90 days to everything and gets F4 and F5 backwards (weight 3 each).
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm doing the flag debt review for our API service. There is no repo for you to look at, everything I have is below. Today is 2026-06-01. For the "long-lived temporary flag" finding class only (not stale, not ownerless, not anything else), tell me which of these flags get that finding.

- F1 `new-invoice-layout`: release flag, added 2026-02-26 (95 days ago), no expiry recorded
- F2 `bulk-export-v2`: release flag, added 2026-03-13 (80 days ago), no expiry recorded
- F3 `payments-kill-switch`: ops flag, added 2023-04-11 (over three years ago), no expiry recorded
- F4 `pricing-page-test-b`: experiment flag, added 2026-05-12 (20 days ago), expiry 2026-05-27
- F5 `search-rewrite`: release flag, added 2025-11-13 (200 days ago), expiry 2026-07-01
- F6 `enterprise-sso`: entitlement flag for paying tenants, added 2025-04-27 (400 days ago), no expiry recorded

End your reply with exactly one line per flag in the form `F1: FINDING` or `F1: OK`, F1 to F6 in order.
