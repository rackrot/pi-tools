---
name: near-miss-gradle-duplicate-version
description: "Near miss: the same NoSuchMethodError-from-two-versions symptom as trigger-maven-1, but in a Gradle build (gradlew, build.gradle.kts), which belongs to gradle."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

after yesterday's okhttp bump the ingest worker dies at startup with `NoSuchMethodError` on `okio.Buffer.readByteString`. `./gradlew build` is green. I'm fairly sure two okio versions are fighting, one of them dragged in by some subproject's `build.gradle.kts`. how do I see which subproject asks for the old one, and how do I force a single version for the whole build?
