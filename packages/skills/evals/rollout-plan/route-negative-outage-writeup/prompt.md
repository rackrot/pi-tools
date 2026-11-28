---
name: route-negative-outage-writeup
description: "Near miss: the write-up of an outage caused by a deploy that was rolled back belongs to postmortem, not to planning or judging a rollout."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

yesterday's 14:10 UTC deploy of checkout-service took card payments down for 38 minutes until we rolled it back at 14:48. it's all fixed now. I have the Slack thread and the pager timeline pasted below, turn them into the incident write-up for Friday's review: what happened when, why it wasn't caught earlier, and the follow-up actions with owners.

14:10 deploy 5.4.0 starts
14:13 first 502s on /pay
14:27 pager fires (error budget alert, 15 min window)
14:31 Dana acks, suspects payment provider
14:44 Dana notices 5.4.0 pods failing readiness against the new vault path
14:48 rollback to 5.3.2 done, errors stop
