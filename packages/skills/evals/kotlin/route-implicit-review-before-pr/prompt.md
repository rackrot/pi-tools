---
name: route-implicit-review-before-pr
description: "Routing case, implicit. A pasted class with GlobalScope, a swallowed broad catch, !! and nested let, and a request that names neither the language nor any of the problems. The kotlin skill should be read."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

can you look this over before I put it up for review? it works on my machine but something about it feels off and I can't say what. no other files to look at, this is the whole thing.

```kotlin
class ProfileLoader(
    private val api: ProfileApi,
    private val cache: ProfileCache,
) {
    var current: Profile? = null

    fun refresh(id: String) {
        GlobalScope.launch {
            try {
                current = api.fetch(id)
                cache.put(current!!)
            } catch (e: Exception) {
            }
        }
    }

    fun displayName(): String =
        current?.let { it.nickname?.let { n -> n.trim() } ?: it.fullName }!!
}
```
