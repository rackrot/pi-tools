---
name: redis-not-postgres-queue
description: A Postgres SKIP LOCKED job queue question does not fire redis.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

Our Postgres 16 `jobs` table is the work queue for 8 workers. Each worker runs `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 10` and then updates the rows. Under load the workers stall on the same rows and the dead tuples pile up. How should I index the table and tune autovacuum so claiming stays fast?
