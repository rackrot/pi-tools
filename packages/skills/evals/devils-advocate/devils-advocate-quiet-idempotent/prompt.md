---
name: devils-advocate-quiet-idempotent
description: Near miss. A code-level claim about an in-flight change before commit belongs to doubt-review, not devils-advocate, and must not load devils-advocate.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Before I commit this, am I sure the new retry wrapper around chargeCustomer() is idempotent? It retries up to three times on a timeout.
