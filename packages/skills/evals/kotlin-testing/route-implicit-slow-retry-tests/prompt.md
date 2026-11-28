---
name: route-implicit-slow-retry-tests
description: Routing, implicit. A slow suite whose cause is real waiting in suspend code; no error string, no library name from the skill description. Self-contained so the model has no file to go looking for.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our backend module's unit tests went from 4 seconds to almost a minute after I added tests for the new backoff logic. this is the class, nothing else is involved (plain Kotlin/JVM, JUnit 5):

```kotlin
class Backoff(private val api: Api) {
    suspend fun call(): String {
        repeat(4) { attempt ->
            try { return api.get() } catch (e: IOException) { delay(3_000L * (attempt + 1)) }
        }
        return api.get()
    }
}
```

and each test is basically `@Test fun retries() = runBlocking { assertEquals("ok", Backoff(FlakyApi(3)).call()) }`. I still want to check that it waits 3s, 6s, 9s between attempts. how do I get the time back?
