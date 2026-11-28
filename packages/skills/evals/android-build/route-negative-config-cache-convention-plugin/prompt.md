---
name: route-negative-config-cache-convention-plugin
description: "Routing, near-miss negative. A configuration cache failure in a custom task of an Android convention plugin is Gradle task wiring (the gradle skill), not android-build."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we switched on the configuration cache for our Android app and now every build stops with

```
Configuration cache problems found in this build.
- Task `:app:stampVersion` of type `com.acme.buildlogic.StampVersionTask`: invocation of 'Task.project' at execution time is unsupported.
```

StampVersionTask is our own task in build-logic, registered from the android application convention plugin. it reads `project.version` and the git sha inside its @TaskAction and writes them to a file. how do I rewrite it so the cache works?
