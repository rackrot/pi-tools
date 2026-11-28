---
name: value-bg-document-and-launch
description: "Value case for the default mode with --bg. The prompt types the slash command (pi expands /skill:handoff inline; the bare arm sees it as plain text). The runner has no shell and no write tool, so the user asks for the document text and the commands to run. The skill fixes what a bare model cannot guess: the six sections (including Open questions and Suggested skills), redaction of the pasted token, a mktemp file in the OS temp directory, the launch line `claude --bg --name \"...\" -- \"$(cat <file>)\"` and the commands that manage the background session. t3 and t5 accept either the Claude Code commands or the pi fallback (`pi -n \"...\" @<file>`, `pi --resume`) the skill prescribes."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:handoff --bg the flaky checkout test

There is no shell and no write tool in this session, so you cannot save or launch anything yourself. Reply with two things I can copy: the handoff document text between a `BEGIN HANDOFF` line and an `END HANDOFF` line, and after it one bash block with the exact commands I should run to save the document and start the new session, plus one line on how I look at that session afterwards. There are no files to open; everything that happened is in these notes.

- Repo ~/src/shop, branch `fix/checkout-flake`. `tests/e2e/checkout.spec.ts` "applies coupon" fails about 1 run in 5 on CI. We are done when CI is green 20 runs in a row.
- Raised the Playwright timeout to 60s: still failed at the same rate, so that is out. It is not slowness.
- Cause found: the coupon request races the cart refetch. `src/cart/useCart.ts:88` refetches on window focus.
- In progress, uncommitted: `await page.waitForResponse('**/api/cart')` added to the spec. 6 local runs green, not yet run on CI.
- To hit the staging cart API we used `STAGING_API_TOKEN=shp_live_9f3kQ27xLm4TzA81` from `.env.staging`.
- Not decided yet, and it is my call: turn off refetch-on-focus for all e2e tests, or patch only this spec.
- Issue: https://git.example.com/shop/shop/issues/412. Coupon rules are specified in docs/specs/coupons.md.
