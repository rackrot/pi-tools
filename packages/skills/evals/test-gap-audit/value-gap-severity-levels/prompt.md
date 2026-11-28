---
name: value-gap-severity-levels
description: Value case. Six test gaps ranked on the audit's P0-P3 scale, each matching exactly one row of the skill's severity table; background jobs and migrations are P1. The bare model has no fixed scale and ranks the job P2 and the migration P3.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

these are the findings from the test gap audit of our orders service. I need the severity filled in on each one before the report goes out, P0 to P3.

- G1: `DELETE /accounts/{id}` hard-deletes the account and everything it owns. No test at any level touches the route.
- G2: the nightly invoice-reminder job in `jobs/remind.py` has no tests.
- G3: the Slack alert client in `integrations/slack.py` has no test for a 429 response from Slack.
- G4: fixtures in `tests/conftest.py` are still named `customer_*` after the model was renamed to `Account`. The tests pass.
- G5: the Alembic migration that adds the nullable `orders.locale` column has no migration test.
- G6: two tests in `tests/test_cart.py` assert the same thing with the same inputs.

end your reply with exactly one line per finding in the form `G1: P0`, G1 to G6 in order.
