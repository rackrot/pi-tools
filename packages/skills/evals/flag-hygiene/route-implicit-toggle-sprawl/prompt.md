---
name: route-implicit-toggle-sprawl
description: "Routing, implicit. Incident reviews blaming forgotten toggles, with a request for one list of every conditional switch, its age and its owner, routes to flag-hygiene without the words flag, audit, stale or debt."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

third incident review this quarter that ends with "a toggle nobody remembered was still switched off in eu-west". I just took over the platform team and there is no list anywhere: some switches are `ENABLE_*` env vars in the Helm values, some are `isEnabled("...")` calls against Unleash, a few are constants someone hardcoded to true two years ago. I want one table of every one of them across the services, when it was introduced, who decides about it, and whether it still changes anything. what's your plan and what does the table look like?
