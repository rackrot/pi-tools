---
name: route-implicit-blind-during-incident
description: "Routing, implicit. A team that could not tell what its service was doing during an incident asks what to build into a new feature; no mention of telemetry, logs, metrics, traces or SLOs."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

tuesday night the checkout service was half broken for two hours and whoever was on call basically had to guess: we couldn't tell which upstream was slow, how many customers were hit, or why some orders failed and others didn't. I'm about to build the new "split payment" feature in the same service (go, about 15 handlers) and I don't want to be blind like that again. what should I build into the feature code so the next person on call can actually see what's going on, and how do we get woken up only when customers are really affected? no repo access here, just give me the plan.
