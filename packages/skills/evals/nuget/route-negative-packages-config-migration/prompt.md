---
name: route-negative-packages-config-migration
description: "Near miss: moving a legacy csproj with packages.config to SDK-style and PackageReference is upgrade work (dotnet-upgrade-guide), which nuget's SKILL.md excludes by name."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Contoso.Billing.csproj is still the long pre-SDK project format on net48 with a packages.config next to it. Move it to the SDK-style format with PackageReference so we can take it to .NET 10 afterwards. What are the steps and what usually breaks?
