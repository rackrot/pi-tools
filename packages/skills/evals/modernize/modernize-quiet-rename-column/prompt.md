---
name: modernize-quiet-rename-column
description: "Near miss: a zero-downtime column rename is a schema migration for db-schema-design, not a sunset plan."
tags: [trigger]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

How do I rename the users.name column to full_name in production Postgres without downtime?
