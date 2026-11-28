---
type: llm
---

PASS only if the response says this task works with the configuration cache (Gradle evaluates the provider when it stores the cache entry) and names creating the provider inside `doLast`/`doFirst` (or using `project` there) as what fails.

FAIL if it says this code breaks the cache or that the provider does not help. Do not reward length or extra advice.
