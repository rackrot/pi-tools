---
name: mysql-not-postgres-index
description: A Postgres EXPLAIN and partial index question does not fire mysql.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

A query on our Postgres 16 `events` table filters on `tenant_id` and `status = 'pending'` and sorts by `created_at`. EXPLAIN (ANALYZE, BUFFERS) shows a sequential scan and a sort. Would a partial index help, and how do I build it without blocking writes?
