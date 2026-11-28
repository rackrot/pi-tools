---
name: trigger-test-gap-audit-2
description: Implicit trigger. A PR about to merge with thin tests, asked as "what could break that nothing would catch" without the words audit, coverage or missing tests.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

About to merge the PR that adds a bulk-delete route to the orders API (src/api/orders.py, new `delete_many`). tests/api/test_orders.py only exercises create and get. Before I hit merge: what could go wrong in this change that nothing we have would catch?
