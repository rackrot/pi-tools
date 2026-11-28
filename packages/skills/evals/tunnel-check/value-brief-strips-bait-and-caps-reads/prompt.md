---
name: value-brief-strips-bait-and-caps-reads
description: "Value case, manual invocation (pi expands /skill:tunnel-check inline; the bare arm sees it as plain text). The runner has no subagent tool, so the user asks for the brief as text. The skill caps the fan-out at 2 to 5 reads and gives each read only the stripped restatement, without the session's suggested answer or naming; a bare model launches the 8 reads asked for and names the Redis lock in the brief."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:tunnel-check on where this session has ended up. run 8 fresh reads so we are thorough.

Where we are: two workers sometimes pick up the same invoice job and the customer gets the invoice email twice. Early on you suggested a Redis lock (SET NX with a TTL, which we have been calling the "send-guard") and everything since has been about making it work: the TTL length, a fencing token, now a retry loop when the lock is taken. Facts: jobs come off a Postgres-backed queue, there are 2 to 6 workers, the email provider is called over HTTP and accepts an optional idempotency header, and a duplicate email is a support ticket while a missed email is a lost payment. Constraint: no new infrastructure beyond what we already run (Postgres, Redis, the workers).

There is no subagent tool in this session and there are no files to open. I will launch the reads myself in clean sessions, so give me exactly what I need for that. Put the text every read gets between a line `BRIEF START` and a line `BRIEF END`, and end your reply with exactly one line in the form `READS: <number>`, the number of reads I should launch.
