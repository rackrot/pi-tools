---
name: route-rca-doc-from-slack-notes
description: "Routing. A resolved outage with rough chat notes and a request for the RCA document routes to postmortem without the word postmortem."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the payments API was returning 502s for about 50 minutes on tuesday night, all fixed now. my manager wants the RCA doc for it by friday and I've never written one here. this is what I pulled out of slack, times are Berlin time:

- 21:04 first 502s on the grafana board (nobody looking)
- 21:31 pagerduty alert fires, Jonas acks at 21:36
- 21:58 Jonas spots that the 20:55 deploy bumped the connection pool config to 5 instead of 50
- 22:02 rollback, errors gone by 22:06
- support says 3 customers wrote in

can you draft it from that and tell me what's still missing?
