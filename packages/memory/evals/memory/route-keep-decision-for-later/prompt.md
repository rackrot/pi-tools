---
name: route-keep-decision-for-later
description: "Routing, explicit. The user asks to keep a just-made decision and its reason for future sessions and asks what was settled earlier on a related point; routes to memory without naming the skill or its tools."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

ok we're going with blue-green for the api deploys. canary was the other option but it needs a service mesh and we don't run one. keep that somewhere you'll still have it next month, with the reason, because I will not remember why. and while you're at it, what did we settle on for the staging database back in spring? I think it was "shared instance, separate schema" but I'm not sure.
