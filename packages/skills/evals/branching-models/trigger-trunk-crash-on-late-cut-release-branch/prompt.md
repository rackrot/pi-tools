---
name: trigger-trunk-crash-on-late-cut-release-branch
description: "A fix needed on a late-cut release branch in a repo where everything lands on main within a day: where to fix, how to carry it over, whether to merge the release branch back."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

everything here lands on main through PRs that live a day at most. last tuesday we cut release/5.3 off main for the app store build and it is in store review now. QA just found a crash in the 5.3 build and main has the same bug. where do I make the fix, how do I get it into both, and do we fold release/5.3 back into main once it ships?
