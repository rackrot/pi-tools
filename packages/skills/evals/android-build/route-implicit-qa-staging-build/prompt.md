---
name: route-implicit-qa-staging-build
description: "Routing, implicit. A request for a third installable QA build of an Android app (a new build type) routes to android-build without naming an error or the plugin."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

QA keeps asking for a build of our Android app that talks to the staging server and can sit on the same phone next to the Play Store version. right now we only have the usual debug and release. what do I need to add so there's a third one they can install, ideally behaving like debug otherwise? two of our library modules only know debug and release, not sure if that matters.
