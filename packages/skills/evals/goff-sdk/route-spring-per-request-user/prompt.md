---
name: route-spring-per-request-user
description: Positive trigger. Wiring flag evaluation for GO Feature Flag into a Spring Boot service through OpenFeature is app-code integration, so goff-sdk should be read.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

ops already runs the go-feature-flag relay proxy at http://goff.internal:1031. I need our Spring Boot orders service to read the boolean flag `new-pricing` per request, keyed on the logged-in customer's id, going through OpenFeature. Which dependency do I add and what does the setup and the evaluation call look like?
