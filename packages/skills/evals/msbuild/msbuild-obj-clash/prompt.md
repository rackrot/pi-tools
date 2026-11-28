---
name: msbuild-obj-clash
description: An intermittent parallel-build file clash routes to msbuild, not nuget.
tags: [routing]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our CI build of App.sln fails maybe one run in five with `error : Cannot create a file when that file already exists` during restore, or `The process cannot access the file '...\obj\Release\Shared.dll' because it is being used by another process`. Re-running usually passes. Several projects set <BaseIntermediateOutputPath>..\..\obj\</BaseIntermediateOutputPath> in a shared props file. What's going on?
