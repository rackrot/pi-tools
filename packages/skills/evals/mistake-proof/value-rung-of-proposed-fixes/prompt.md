---
name: value-rung-of-proposed-fixes
description: Value case. Rates six proposed fixes on the control / warning / detection / docs-only ladder. The skill's non-obvious rulings are that opt-in safety (optional idempotency key, opt-in dry run) and a unit-carrying name are docs-only and that a lint rule enforced in CI is a warning; the bare model tends to rate these one or two rungs too high.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

action items from the double-charge postmortem. before we sign off I want each one rated by how well it mistake-proofs the thing it is aimed at: CONTROL, WARNING, DETECTION or DOCS (docs-only). rate the item exactly as written, not an improved version of it.

- A1: `charge()` gets a new optional `idempotency_key` argument. When a caller passes one, a unique index on `(customer_id, idempotency_key)` rejects the duplicate charge.
- A2: rename the `timeout` parameter of the payment client to `timeout_ms`, so nobody passes seconds again.
- A3: turn on the Ruff rule that flags bare `except:` at error level and run it in CI as a required check, so a pull request with a violation cannot merge.
- A4: a Datadog monitor that pages on-call when the same order has more than one successful charge within 10 minutes.
- A5: a `UNIQUE` constraint on `payments(order_id, attempt_no)`, so a second insert for the same attempt fails.
- A6: `purge_stale_charges.py` gets a `--dry-run` flag that prints the rows it would delete. Without the flag it deletes as before.

end your reply with exactly one line per item in the form `A1: CONTROL`, A1 to A6 in order, using only those four words.
