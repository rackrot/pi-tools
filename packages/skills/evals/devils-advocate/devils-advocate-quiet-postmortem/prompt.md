---
name: devils-advocate-quiet-postmortem
description: Near miss. Writing up an incident that already happened is the postmortem skill's job, not a pre-mortem on an idea, and must not load devils-advocate.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Checkout was down for 47 minutes last night after a bad config push went out. Write up the postmortem for it: timeline, what went wrong and why, and action items so it doesn't happen again.
