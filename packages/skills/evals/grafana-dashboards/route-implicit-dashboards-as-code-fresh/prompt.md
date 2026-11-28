---
name: route-implicit-dashboards-as-code-fresh
description: "Routing, implicit, fresh phrasing. Wanting hand-made Grafana boards kept in git and reloaded on startup routes to grafana-dashboards."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Grafana in docker compose keeps losing the charts people build in the browser whenever we recreate the container. I want them committed to the repo and loaded automatically on boot. what's the cleanest way?
