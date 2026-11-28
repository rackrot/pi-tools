---
name: route-negative-sbt-eviction
description: "Near miss: a dependency coordinate and eviction question about build.sbt in a cross-built project belongs to sbt, not to scala."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need to add circe-parser to our build.sbt. the project is cross-built for 2.13 and 3, and since my last change sbt prints an eviction warning that cats-core 2.10.0 was evicted by 2.12.0. should the new line use % or %% here, and how do I find out which library is still pulling in the old cats-core?
