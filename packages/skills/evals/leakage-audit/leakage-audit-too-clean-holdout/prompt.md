---
name: leakage-audit-too-clean-holdout
description: "Implicit trigger: a holdout score that jumped further than anyone expected, with no mention of leakage, independence or an audit, routes to leakage-audit."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our new reranker scores 99.2% on the holdout set Priya put together last week, up from 81%. nobody expected a jump like that. Priya also tuned the reranker. before this goes in the quarterly deck, what should I be checking?
