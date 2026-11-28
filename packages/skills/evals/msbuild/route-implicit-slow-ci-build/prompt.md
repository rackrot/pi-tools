---
name: route-implicit-slow-ci-build
description: "Routing, implicit. A slow CI build with no idea where the time goes routes to msbuild; no XML, no error code and no build-system term in the prompt."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

CI went from about 6 minutes to 14 over the last couple of months and nobody can say why. it's one step, `dotnet build Platform.sln -c Release`, roughly 140 C# projects, and the tests run in a later step so it's not them. people keep guessing (analyzers? too many projects? the agents?) and I don't want to guess. where do I start to find out what is actually eating the time?
