---
name: value-net11-process-json
description: Value case. On net11.0 the hand-rolled process capture, PascalCase naming policy and JsonTypeInfo cast each have a built-in replacement (Process.RunAndCaptureText, JsonNamingPolicy.PascalCase, GetTypeInfo<T>); the bare model does not know the .NET 11 additions.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

We just retargeted our build tool to net11.0 and I'd like to delete helper code the framework now covers. Three helpers:

1. `GitRunner.Run`: builds a ProcessStartInfo, redirects stdout and stderr, reads both with two concurrent ReadToEndAsync calls so the child can't block, waits with a 30 second timeout and kills the process tree when it expires. Callers get the exit code plus both streams as strings. It is called synchronously.
2. `PascalCaseNamingPolicy : JsonNamingPolicy`, used as `PropertyNamingPolicy` so our JSON has PascalCase names.
3. `(JsonTypeInfo<BuildManifest>)options.GetTypeInfo(typeof(BuildManifest))`, repeated in a dozen places.

For each one, what in .NET 11 replaces it?

End your reply with exactly these three lines:

Process: <Type.Method that replaces GitRunner.Run>
Naming: <Type.Member that replaces the custom policy>
TypeInfo: <the call that replaces the cast, written for BuildManifest>
