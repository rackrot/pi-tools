---
name: route-negative-xunit-v3-migration
description: "Near miss: moving test projects from xUnit v2 to xUnit v3 is a framework major upgrade, which the skill hands to dotnet-upgrade-guide. dotnet-testing must not be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we have six test projects still on the xunit 2.9 package and I want them on xunit.v3 this sprint. what has to change in the csproj files and in the test code, what breaks, and in what order should I do the migration so the build stays green between steps?
