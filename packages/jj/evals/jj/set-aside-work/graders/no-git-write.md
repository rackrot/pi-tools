---
type: regex
pattern: '"command":"(?:\\.|[^"\\]){0,}\bgit (commit|add|checkout|reset|stash|rebase|switch|restore)\b'
match: not_contains
target: trace
---
