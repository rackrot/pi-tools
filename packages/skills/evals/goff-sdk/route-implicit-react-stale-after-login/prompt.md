---
name: route-implicit-react-stale-after-login
description: Positive trigger, implicit. A symptom in a React app whose flags come from GOFF (stale evaluation after login) is a client provider and context problem, so goff-sdk should be read. The prompt does not ask for an integration.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our React dashboard gets its flags from GOFF. after someone logs in they keep seeing the anonymous variant of `beta-nav` until they hard refresh the page, even though their account is in the rollout. the flag file is fine, ops checked it with the cli. what are we doing wrong on the frontend?
