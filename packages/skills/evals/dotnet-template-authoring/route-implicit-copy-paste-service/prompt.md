---
name: route-implicit-copy-paste-service
description: "Routing, implicit. Replacing copy-paste-and-rename of a starter service with a one-line generator command is template authoring, though the prompt never says template or template.json."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

every time someone starts a new service here they copy the Contoso.Starter.Api folder, then spend an hour renaming namespaces, the csproj and the folder by hand, and half of them forget to delete the Redis bits when they don't need a cache. I want that to be a single command, something like `dotnet new contoso-api -n Billing.Api --cache false`. how do I set that up?
