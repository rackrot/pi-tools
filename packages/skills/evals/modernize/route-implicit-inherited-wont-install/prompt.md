---
name: route-implicit-inherited-wont-install
description: "Routing, implicit. An inherited app on end-of-life versions that no longer installs, with a where-do-I-start question, routes to modernize without the words modernize, legacy, upgrade, migrate or plan."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I inherited the customer portal last month. AngularJS 1.5 front end, a Node 8 API, Mongo 3.4. on my laptop `npm install` dies on node-sass, there is no lockfile, the handful of tests that exist don't start, and the thing still serves about 300 customers from a VM nobody has patched since 2019. the people who wrote it are gone. I can't leave it like this but I honestly don't know where to begin or what order things should go in. no code to show you yet, I'm asking from my phone.
