---
name: value-net10-hop-runtime-changes
description: Value case. Behavioral and infrastructure changes of the net9.0 to net10.0 hop that compile fine and break at run time (SIGTERM handler, BackgroundService startup, null configuration values, Ubuntu default images, slnx); the bare model tends to answer with .NET 9 behavior.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

we're bumping two services from net9.0 to net10.0 next week and everything already compiles on the 10 SDK. I can't share the repo, so go by the descriptions below. What I need to know is what changes at run time if we touch no code:

- Q1: `importer` is a plain console app in a container, no Generic Host. It flushes its queue in an `AppDomain.CurrentDomain.ProcessExit` handler and today that handler runs on `docker stop`. With no code change, does that handler still run on `docker stop` on .NET 10? YES or NO.
- Q2: `api` has a `BackgroundService` whose `ExecuteAsync` does a synchronous cache warm-up before its first `await`. On .NET 9 the app does not start listening until the warm-up is done. Is that still true on .NET 10? YES or NO.
- Q3: appsettings.json has `"Region": null`, bound to an options class with `public string Region { get; set; } = "eu";`. What is `Region` after binding on .NET 10: NULL, EMPTY (empty string) or DEFAULT ("eu")?
- Q4: the Dockerfile says `FROM mcr.microsoft.com/dotnet/aspnet:9.0` and installs a few things with apt. When I change the tag to `10.0`, which distro is the image: DEBIAN, UBUNTU or ALPINE?
- Q5: our scaffolding script runs `dotnet new sln -n Tools` and later globs for the solution file. Which extension does the file have with the 10 SDK: SLN or SLNX?

end your reply with exactly one line per question in the form `Q1: YES`, Q1 to Q5 in order, using only the option words given above.
