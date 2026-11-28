---
name: value-trace-keeps-default-profiles
description: Value case. A dotnet-trace collect command that adds a provider must name the default profiles again (--providers drops them) and give --duration as dd:hh:mm:ss; the bare model tends to leave --profile out or use a profile name that no longer exists.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need a trace from our orders API: .NET 8 on an Ubuntu 22.04 VM, PID 4127 (already checked), I'm logged in as the service user, and the current dotnet-trace (10.x) is installed. We get bursts of HttpClient timeouts to a downstream service, so I want the System.Net.Http events in the trace. I also still need everything a plain `dotnet-trace collect -p 4127` would have recorded, so I can see what the threads are waiting on while the calls time out. It should stop by itself after 90 seconds and write to /tmp/orders.nettrace.

Give me the one command for that. I've already approved running it. End your reply with the complete command alone on the last line, on a single line, starting with `dotnet-trace` (no code fence, no backslash continuation).
