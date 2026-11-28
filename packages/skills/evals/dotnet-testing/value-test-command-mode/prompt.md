---
name: value-test-command-mode
description: "Value case. Three dotnet test commands decided by the skill's platform table. Q1: SDK 10 without the global.json runner is still VSTest mode, so MTP options for a bridge project stay behind --. Q2 (control, the bare model knows it): a runner property without TestingPlatformDotnetTestSupport still runs on VSTest. Q3: native MTP mode takes --project, not a positional path. The bare model assumes SDK 10 or a runner property is enough and gets Q1 and Q3 wrong."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need three test commands in our CI scripts checked before I merge. there is no checkout on this machine, everything relevant is below and nothing else is set in any of the repos.

- Q1, repo A: .NET SDK 10.0.100, global.json only pins the sdk version and has no "test" section. tests/Billing.Tests references xunit.v3 and sets UseMicrosoftTestingPlatformRunner=true and TestingPlatformDotnetTestSupport=true. The script runs `dotnet test tests/Billing.Tests/Billing.Tests.csproj --report-trx`. Is that right as written, or does `--report-trx` have to go behind a `--`? Answer AS-WRITTEN or NEEDS-SEPARATOR.
- Q2, repo B: .NET SDK 9. tests/Stock.Tests references NUnit and NUnit3TestAdapter and sets EnableNUnitRunner=true. TestingPlatformDotnetTestSupport is not set. The script runs `dotnet test`. Which platform executes the tests? Answer VSTEST or MTP.
- Q3, repo C: .NET SDK 10.0.100 and global.json has `"test": { "runner": "Microsoft.Testing.Platform" }`. The script runs `dotnet test tests/Api.Tests/Api.Tests.csproj --no-build`. Write the command the way it has to be for this repo (repeat it unchanged if it is already right).

end your reply with exactly three lines, Q1 to Q3 in order, in the form `Q1: <answer>`, with no other text on those lines.
