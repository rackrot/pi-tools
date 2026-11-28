---
name: route-implicit-boards-lost-on-rebuild
description: "Routing, implicit. Boards lost on a rebuild and a datasource-not-found import error route to grafana-dashboards without the words dashboard, provisioning, as code or UID."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we rebuilt the monitoring VM over the weekend and everything the team had clicked together in Grafana is gone, only one board that someone had exported survived. after re-importing that one on the new box every panel says "datasource not found". how do I set this up so the boards live in our repo and come back by themselves when the container starts, and so an import doesn't break like that again?
