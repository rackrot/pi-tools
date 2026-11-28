---
name: route-negative-minsdk-manifest-merger
description: Near-miss negative. An Android app whose Gradle build fails in the manifest merger over a library's minSdk is a build problem (android-build), not app code, so the android skill should stay closed.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our Android app stopped building after I added the Health Connect client so the step counter can sync. gradle dies with "Manifest merger failed : uses-sdk:minSdkVersion 21 cannot be smaller than version 26 declared in library [androidx.health.connect:connect-client]". we still have a lot of users on Android 7 so I can't just raise minSdk for everyone. what are my options?
