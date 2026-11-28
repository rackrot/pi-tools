---
name: route-implicit-same-variant-per-team
description: Implicit positive trigger. The product is never named; only the flag file shape (variations, defaultRule, percentage) and the wish to split by team instead of by user point at GO Feature Flag flag files.
tags: [routing]
max_turns: 5
allowed_tools: [Read, Glob, Grep, Skill]
---

people on the same team are seeing different versions of the dashboard and support is getting tickets about it. the split is defined like this in our flags yaml:

```yaml
team-dashboard:
  variations:
    classic: "v1"
    modern: "v2"
  defaultRule:
    percentage:
      classic: 50
      modern: 50
```

every request already sends the user id plus `teamId`. what do I change so a whole team always lands on the same side, and is there anything that can go wrong with it?
