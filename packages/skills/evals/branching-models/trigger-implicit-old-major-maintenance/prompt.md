---
name: trigger-implicit-old-major-maintenance
description: "Routing, implicit. Maintaining an old major line in a repo described only by its branches (main, develop, release/*, hotfix/*), without the words git-flow or support branch, routes to branching-models."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

main is on 3.4.0 and all new work goes through develop, with release/* and hotfix/* branches the usual way. a big customer is stuck on 1.9.4 and needs a security patch there, and they will want more of those over the next year. our hotfix branches always come off main, which is two majors ahead. how do I set up something long-lived for the 1.x line that fits how the rest of this repo is organised, and where do the fixes on it get merged?
