---
name: dotnet-diagnostics-negative-nullable
description: Enabling nullable reference types in a C# project is csharp work, not dotnet-diagnostics.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

I just turned on `<Nullable>enable</Nullable>` in our C# class library and got 300 CS8602 and CS8618 warnings. What is a sane order to fix them without sprinkling `!` everywhere?
