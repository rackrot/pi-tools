---
name: value-provider-in-register-works
description: Value case. A provider created in the register block and read with get() in doLast works with the configuration cache.
tags: [value]
model: claude-sonnet-5-5
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Does this task in app/build.gradle.kts break the configuration cache? I'm told a provider doesn't help because `.get()` runs at execution time.

```kotlin
tasks.register("printVersion") {
    val v = providers.provider { project.version }
    doLast { println(v.get()) }
}
```
