---
name: route-upgrade-stuck-in-progress
description: Explicit trigger. A deploy job killed mid-upgrade leaves the release locked; debugging a failed helm upgrade routes to helm.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the deploy job got cancelled halfway through last night and now every pipeline run dies with

```
Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress
```

release is `billing-api` in namespace `payments`. nobody is deploying right now, I checked. how do I get it unstuck without making things worse?
