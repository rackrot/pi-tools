---
name: route-negative-publish-pack
description: "Near miss: pushing an already built template pack to nuget.org with trusted publishing is package publishing (nuget), not template authoring."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Contoso.Templates.1.4.0.nupkg is built and tested. set up the GitHub Actions release job that pushes it to nuget.org on a tag, using trusted publishing so we don't keep a long-lived API key in secrets.
