---
type: regex
pattern: '"command":"(?:\\.|[^"\\])*\bgit (commit|add|checkout|reset|stash|rebase|switch)\b'
match: not_contains
target: trace
---
