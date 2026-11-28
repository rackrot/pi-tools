---
name: route-implicit-overnight-bundle-size
description: "Routing, implicit. Someone leaving for the night wants the agent to keep trying ways to shrink a bundle against a size script and show what worked; no mention of loop, experiment, branch or log."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the main bundle of our web app is 2.1 MB and I want it as small as it will go. `npm run size` prints the gzipped byte count on its last line. I'm leaving for the night, so just keep trying things by yourself until morning and hold on to whatever actually makes the number go down. `npm test` has to stay green. tomorrow I want to see what you tried and what worked. how are you going to go about it?
