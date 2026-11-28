---
name: route-implicit-too-many-panels
description: "Routing, implicit, fresh phrasing. A Grafana board with forty panels nobody reads and a question about what belongs at the top routes to grafana-dashboards."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our on-call Grafana page for the payments service has about forty panels and nobody can find anything during an incident. what should stay, what goes at the top, and what can we delete?
