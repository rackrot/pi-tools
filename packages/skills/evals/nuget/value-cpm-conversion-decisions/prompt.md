---
name: value-cpm-conversion-decisions
description: Value case. Five calls during Central Package Management conversions where the skill's rule differs from the usual instinct (packages.config guard, no upgrade past the highest version in scope, transitive pinning left off, no test run or vulnerability scan for a version-neutral conversion).
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Please convert three of our repos to Central Package Management with a Directory.Packages.props each. All projects are SDK-style unless I say otherwise. I can only give you the clones tomorrow, so today I need your plan: below is what our scan found, and for each point tell me what you will do, so I can warn the repo owners.

Repo A: one solution, 14 projects. 13 use PackageReference. Contoso.Reports.Legacy still has a packages.config.
- Q1: do you convert the 13 PackageReference projects to CPM now and leave Legacy for a follow-up? YES or NO.

Repo B: Serilog is referenced at 3.1.1 in nine projects and at 4.0.0 in four. The newest Serilog on nuget.org is 4.3.0. The owner said: "one version everywhere, move the old ones up".
- Q2: which Serilog version do you put in Directory.Packages.props?
- Q3: nobody mentioned transitive pinning. Do you set CentralPackageTransitivePinningEnabled to true as part of the conversion? YES or NO.

Repo C: no version conflicts. After your edits the before and after resolved package lists are identical for every project, and restore and build are clean. Nobody asked about security.
- Q4: do you run the test suite before you report the conversion as done? YES or NO.
- Q5: do you run a `--vulnerable` package scan as part of the conversion? YES or NO.

a sentence of reasoning per point is enough. End your reply with exactly these five lines:

Q1: YES or NO
Q2: <version>
Q3: YES or NO
Q4: YES or NO
Q5: YES or NO
