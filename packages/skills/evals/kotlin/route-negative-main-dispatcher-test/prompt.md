---
name: route-negative-main-dispatcher-test
description: "Routing case, near-miss negative. Kotlin coroutine code, but the failure is in a unit test's dispatcher setup, which SKILL.md hands to kotlin-testing. The kotlin skill should not be read."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

My unit test for CartViewModel dies before the first assertion with "Module with the Main dispatcher had failed to initialize. For tests Dispatchers.setMain from kotlinx-coroutines-test module can be used". It's a plain JVM test with JUnit 5 and `runTest`, and the ViewModel calls `viewModelScope.launch` in a `load()` function the test calls. The app itself runs fine. What does the test need so this stops happening?
