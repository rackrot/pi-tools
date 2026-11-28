---
name: value-tfm-condition-in-props
description: Value case. A TargetFramework condition in Directory.Build.props is ignored on a property for a single-targeting project but applies on an item group, in a multi-targeting inner build and in Directory.Build.targets; the bare model tends to call every props-level TargetFramework condition broken, or none.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm cleaning up the shared build files in our repo and want to know which of these settings actually take effect. all projects are SDK-style (`Microsoft.NET.Sdk`), there is one `Directory.Build.props` and one `Directory.Build.targets` at the repo root, nothing passes `-p:TargetFramework` on the command line, and none of the projects set these things themselves.

- S1: `Directory.Build.props` has
  ```xml
  <PropertyGroup Condition="'$(TargetFramework)' == 'net8.0'">
    <DefineConstants>$(DefineConstants);FAST_PATH</DefineConstants>
  </PropertyGroup>
  ```
  Is `FAST_PATH` defined when `Api.csproj` compiles? Api.csproj has `<TargetFramework>net8.0</TargetFramework>`.
- S2: the same block in `Directory.Build.props`. Is `FAST_PATH` defined when the net8.0 assembly of `Lib.csproj` compiles? Lib.csproj has `<TargetFrameworks>net8.0;net472</TargetFrameworks>`.
- S3: `Directory.Build.props` has
  ```xml
  <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <PackageReference Include="System.Memory" Version="4.5.5" />
  </ItemGroup>
  ```
  Does `Legacy.csproj` get the System.Memory reference? Legacy.csproj has `<TargetFramework>net472</TargetFramework>`.
- S4: the S1 block moved unchanged into `Directory.Build.targets`. Is `FAST_PATH` defined when `Api.csproj` compiles?

end your reply with exactly one line per setting in the form `S1: APPLIES` or `S1: IGNORED`, S1 to S4 in order.
