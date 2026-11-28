---
type: regex
pattern: 'gh issue create[^\n]*(--body-file|-F)[ =]\S*bodies/1\.md'
flags: i
weight: 1
target: last_message
---
