---
name: not-android-testing-viewmodel-jvm
description: Near-miss negative. A ViewModel test in an Android app module that needs no Android runtime (fake repository, runTest, Turbine, Main dispatcher error) belongs to kotlin-testing and must not load android-testing.
tags: [negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

A ViewModel test in our Android app module fails before the first assertion:

```
java.lang.IllegalStateException: Module with the Main dispatcher had failed to initialize. For tests Dispatchers.setMain from kotlinx-coroutines-test module can be used
```

The ViewModel only takes a fake repository, there is no Context or anything else from the framework in it. The test collects uiState with Turbine inside runTest. What is missing?
