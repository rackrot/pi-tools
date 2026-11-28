---
name: route-conflicted-change-after-rebase
description: "Positive trigger. A user who names jj in passing and asks how to fix a conflicted change in a rebased stack routes to jj."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I rebased my stack in jj and now one of the changes in the middle shows up as conflicted, and my feature bookmark is still sitting on the old spot. Walk me through sorting both out.
