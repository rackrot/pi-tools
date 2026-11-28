---
name: route-implicit-ci-restore-drift
description: "Implicit trigger: a CI restore that resolves a different package version than the developer machine is lock-file work (nuget). The prompt names neither NuGet nor lock files."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

same commit, two results: the build agent pulled Newtonsoft.Json 13.0.4 last night and my machine still has 13.0.3, because Contoso.Billing.csproj says `Version="13.*"`. I want every agent to get exactly the dependency graph we tested, transitive ones included, and the pipeline to go red if it would resolve anything else. what do I put in the csproj, what do I commit and what does the CI restore step look like?
