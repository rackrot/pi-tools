---
name: route-implicit-cs8032-after-bot-bump
description: "Routing, implicit. A shipped analyzer that stops loading in an older Visual Studio after a dependency-bot bump (CS8032, Microsoft.CodeAnalysis version mismatch) routes to roslyn-analyzers, not to nuget or renovate, without asking to write an analyzer."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

since we shipped 3.2.0 of our library, a customer on Visual Studio 2022 17.8 gets this on every project that references it, and none of our ACME rules show up for them any more:

```
warning CS8032: An instance of analyzer Acme.Analyzers.AvoidBlockingAnalyzer cannot be created from C:\Users\dev\.nuget\packages\acme.core\3.2.0\analyzers\dotnet\cs\Acme.Analyzers.dll: Could not load file or assembly 'Microsoft.CodeAnalysis, Version=4.14.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35' or one of its dependencies. The system cannot find the file specified.
```

our own CI is green and it works for everyone here on the newest VS. the only related change in 3.2.0 was the bot's monthly dependency PR. what went wrong, and how do we set things up so this cannot happen again?
