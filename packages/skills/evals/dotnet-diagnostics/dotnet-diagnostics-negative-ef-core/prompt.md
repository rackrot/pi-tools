---
name: dotnet-diagnostics-negative-ef-core
description: A slow EF Core query with N+1 loading routes to ef-core, not dotnet-diagnostics.
tags: [routing, negative]
runs: 1
max_turns: 6
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

Our orders page is slow. The EF Core query loads `Orders` and then touches `order.Customer` and `order.Lines` in a loop, and the SQL log shows hundreds of queries per request. How should I restructure the DbContext query?
