---
name: route-implicit-cancelled-two-meanings
description: "Routing, implicit. Two reports disagree because finance and product mean different things by a cancelled customer; no mention of glossary, terminology, naming or domain model. Routes to domain-modeling."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

finance and product had the same argument in standup again. the churn dashboard counts a customer as cancelled the day they click the cancel button, the revenue report only counts them once the paid period has run out, so the two numbers never match and each side thinks the other one has a bug. I don't think either is a bug, I think the two teams just mean different things. help me sort this out with them so it stops coming up, and so the next engineer who touches either report knows which one is meant.
