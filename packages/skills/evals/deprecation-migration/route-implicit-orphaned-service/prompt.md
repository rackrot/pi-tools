---
name: route-implicit-orphaned-service
description: "Routing, implicit. An unowned service that three teams still call, with a keep-or-retire question, routes to deprecation-migration without the words deprecate, sunset or migrate."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the report-export service hasn't had a commit in 14 months, the person who wrote it left, its CI has been red since spring and it's pinned to a library version with two open CVEs. access logs say billing, support-tools and the partner portal still call it every day. the new analytics service can already produce the same exports. what should we do with report-export, and in what order?
