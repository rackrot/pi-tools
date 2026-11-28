---
name: route-negative-prisma-migrate-reset
description: "Routing, negative near-miss. A Prisma migrate drift and reset question on a MySQL datasource belongs to prisma, not mysql."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

`npx prisma migrate dev` now stops with "Drift detected: Your database schema is not in sync with your migration history" and offers to reset the database. datasource provider is mysql, it's our shared dev db and I can't lose the data in it. a teammate edited an already-applied migration file last week to fix a typo in a column name. how do I get migrate dev working again without the reset?
