---
name: value-file-app-second-file
description: Value case. Splitting a file-based C# app across two files needs the include directive, which only exists from SDK 10.0.300; the bare model guesses the directive but not its SDK floor (10.0.100, 11.0.100 or none).
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I keep a one-file C# utility, report.cs, on my build box and run it with `dotnet run report.cs`. There is no .csproj anywhere near it and `dotnet --version` there prints 10.0.100. It has grown, so I want to move the helper classes into a second file, Helpers.cs, in the same folder, and keep running it the same way without creating a project. Can I do that with the SDK I have, and if not, which SDK do I need? The files are on the build box, not on this machine, so there is nothing to open here.

End your reply with exactly these two lines:

Directive: <the line to add to report.cs so Helpers.cs is compiled with it>
MinSdk: <lowest .NET SDK version on which that line works, as x.y.zzz>
