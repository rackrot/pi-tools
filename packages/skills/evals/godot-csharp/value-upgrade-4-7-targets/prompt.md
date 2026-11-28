---
name: value-upgrade-4-7-targets
description: Value case. A Godot .NET project moved from 4.6 to 4.7 with net8.0; the Android .NET 9 requirement, the missing web export and the Animation.Length type change; the bare model answers Android from Godot 4.2 to 4.4, where net8.0 was enough.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we just moved our C# game from Godot 4.6 to 4.7. Skyline.csproj now reads:

```xml
<Project Sdk="Godot.NET.Sdk/4.7.0">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <EnableDynamicLoading>true</EnableDynamicLoading>
  </PropertyGroup>
</Project>
```

The publisher wants two more builds besides Windows: Android, and a browser build for itch.io. Separately, a teammate is typing a helper around this line and asks what he gets on 4.7:

```csharp
var len = _animPlayer.GetAnimation("run").Length;
```

Tell me what holds with the project exactly as it is, no workarounds.

end your reply with exactly these four lines, filled in:
`ANDROID: YES` or `ANDROID: NO` (can it be exported with this csproj)
`ANDROID_MIN_TFM: net<N>.0` (the lowest TargetFramework an Android export of this project accepts on 4.7, for example `ANDROID_MIN_TFM: net6.0`)
`WEB: YES` or `WEB: NO` (can it be exported at all)
`LEN_TYPE: float` or `LEN_TYPE: double` (the static type of `len` on 4.7)
