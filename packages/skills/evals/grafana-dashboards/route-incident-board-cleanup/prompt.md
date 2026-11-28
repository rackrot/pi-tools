---
name: route-incident-board-cleanup
description: "Routing, explicit. Cutting an overgrown service board down to what on-call needs routes to grafana-dashboards."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our grafana board for the payments API has grown to 46 panels, and during last week's outage nobody could tell from it whether the service was actually broken. I want to cut it down to something on-call can read in ten seconds. how would you restructure it, and what goes at the top?
