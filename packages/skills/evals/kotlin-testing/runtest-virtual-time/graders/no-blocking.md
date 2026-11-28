---
type: regex
pattern: 'Thread\.sleep\(|runBlocking\s*[({]'
match: not_contains
target:
  source: file
  path: src/test/kotlin/acme/RetryingClientTest.kt
---
