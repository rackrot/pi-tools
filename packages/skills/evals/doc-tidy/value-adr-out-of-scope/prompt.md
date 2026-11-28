---
name: value-adr-out-of-scope
description: 'Value case. /skill:doc-tidy loads the manual skill (pi expands it inline; the bare arm sees plain text). The document is an ADR whose update notes and struck-through status are its history, which the skill puts out of scope: say so and stop. The bare model rewrites it as a clean current-state doc and erases the record.'
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:doc-tidy docs/adr/0007-job-queue.md

Over two years it has collected update notes and struck-through lines and reads like a patchwork. Make it say what is true now. The file is pasted below, there is nothing to open or write.

# ADR 0007: Job queue

Status: ~~Proposed~~ ~~Accepted (2022-04-11)~~ Superseded by ADR 0012 (2024-06-03)

## Context

Report exports took up to 40 seconds and timed out behind the load balancer, so they had to move out of the request cycle. We already ran Redis for sessions.

## Decision

Run background jobs on Redis with BullMQ, one queue per job type.

Update 2023-02: export jobs moved to a dedicated `exports` worker pool after they starved email delivery.

Update 2024-06: ~~Redis remains the queue backend.~~ Replaced by the Postgres-backed queue, see ADR 0012. Redis is used for sessions only.

## Consequences

- Jobs are lost if Redis restarts without AOF. Previously accepted; this is the main reason for ADR 0012.
- One more client library to keep current.

End your reply with exactly one line: `ADR 0007: REWRITTEN` if your reply gives new text for the file, or `ADR 0007: UNTOUCHED` if it does not.
