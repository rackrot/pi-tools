---
name: value-memory-cannot-confirm
description: Value case. The slash command loads the manual skill (the bare arm sees it as plain text). Five numbered claims, one config file pasted, no web access. Claims 2 and 5 are well-known external facts with no source in reach; the skill says memory cannot confirm a claim and external facts are checked against sources fetched now, so both are UNVERIFIED. The bare model tends to mark them CONFIRMED from memory. Claim 4 is not contradicted by the file but not supported either.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:fact-check this message before I post it to the ops channel for tonight's cutover. The one project file it talks about is pasted below. There are no files to open, and you have no web access in this session.

> (1) Our cache client connects to Redis on port 6380. (2) Redis's own stock default port is 6379. (3) Our connection pool is capped at 20 connections. (4) The client retries a failed command three times before giving up. (5) TLS support was added to Redis in version 6.0.

config/cache.yaml:

```yaml
redis:
  host: cache-01.internal
  port: 6380
  pool:
    max_connections: 50
```

End your reply with exactly five lines, 1 to 5 in order, each in the form `1: CONFIRMED`, `1: WRONG` or `1: UNVERIFIED`.
