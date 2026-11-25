---
name: modernize-sunset-v1
description: "Planning an API sunset with many external consumers routes to modernize."
tags: [routing]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

We are sunsetting the v1 API, which has about 200 external consumers and a v2 replacement. Plan the deprecation.
