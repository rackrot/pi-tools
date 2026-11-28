---
name: leakage-audit-ab
description: "An A/B result where the same model wrote the variants and judged the comparisons routes to leakage-audit. Phrased without the description's trigger sentences."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we ran prompt v2 against v1 on 200 support tickets. v2 won 71% of the head to head comparisons, and the comparisons were judged by the same model that wrote both replies. can I report that 71% to the team as a real improvement?
