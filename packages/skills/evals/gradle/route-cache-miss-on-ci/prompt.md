---
name: route-cache-miss-on-ci
description: Trigger by symptom. A task that never gets a remote cache hit on CI, reported in the user's own words with no error string, should load the gradle skill.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

On CI `./gradlew build` runs `:api:generateClient` from scratch every time, even on a commit that only touched the README. The remote cache is on and the other tasks come back FROM-CACHE. On my laptop a second run says UP-TO-DATE. It's a custom task class we wrote in-house, about 40 lines, takes a spec file and writes Kotlin sources. I'm not at my desk so I can't paste it. What should I look at first?
