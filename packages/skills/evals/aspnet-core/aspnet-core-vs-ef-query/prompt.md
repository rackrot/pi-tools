---
name: aspnet-core-vs-ef-query
description: Adding an EF Core migration for a new column is owned by ef-core and should not load aspnet-core.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a nullable LoyaltyTier string property (max 32 characters, indexed) to the Customer entity in our EF Core model, generate the migration with dotnet ef, and show me what its Up and Down methods should contain.
