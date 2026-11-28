---
name: route-implicit-stream-pinning
description: "Implicit trigger: streaming RPC load pinned to one backend behind an L4 balancer; no proto or skill wording in the ask."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We added a WatchOrders server-streaming call to the order service last sprint. Since then one pod sits at 90% CPU while the other five idle, and the mobile gateway that holds the long-lived connections is the only caller. The service sits behind an AWS NLB. What should we change?
