---
name: value-copy-mode-mutated-fixture
description: Value case. A fixture the tests mutate in the output folder needs CopyToOutputDirectory=IfDifferent, and SkipUnchangedFilesOnCopyAlways softens existing Always items (both MSBuild 17.13+); the bare model tends to stay on Always or PreserveNewest and to say no such property exists.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

our integration tests open `testdata/seed.db` from the output folder and write to it. the test csproj has

```xml
<None Include="testdata\**\*" CopyToOutputDirectory="Always" />
```

which covers seed.db plus about 900 other fixture files, so every build re-copies all of them even when nothing changed, and that's a good chunk of our no-change build time. I tried `PreserveNewest`, but then a seed.db the tests have written to is not put back on the next build, because the copy in bin is newer than the source.

we build with .NET SDK 9.0.300 everywhere (CI and dev machines), no Visual Studio.

two questions:
1. which `CopyToOutputDirectory` value gives me "put the source back when the copy in the output folder was changed, otherwise skip the copy"?
2. separately: is there one built-in property I could set once so that items left on `Always` skip files that are unchanged? if there is none, say NONE.

end your reply with exactly these two lines:

MODE: <the CopyToOutputDirectory value>
PROPERTY: <the property name, or NONE>
