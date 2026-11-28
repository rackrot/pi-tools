---
name: route-implicit-prerelease-library-check
description: "Routing, implicit. A pre-release check for outdated and vulnerable libraries in a project described only by its pom.xml and mvnw, without the word Maven, audit or dependency."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we tag 2.4.0 of the order service on Friday. before that I want to know which of the libraries we ship are behind or have known CVEs, and what you'd bump now versus after the release. it's the usual layout: root pom.xml with five modules, mvnw checked in, versions mostly in the root pom's properties. tell me what you'd run and how you'd report it, I'll paste output as we go.
