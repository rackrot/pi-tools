---
name: route-implicit-upload-limit
description: "Implicit trigger: one limit with four different values across nginx, Helm, an API constant and the docs, and a user who wants to change it in one spot. No 'source of truth', 'copies' or 'canonical' wording."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

bumped the max upload size to 50 MB last sprint. turns out nginx.conf still caps it at 25, the helm values say 20, the API constant is 50 and the public docs promise 10. i end up chasing this number around every time it changes. sort it out so i only ever have to touch it in one spot
