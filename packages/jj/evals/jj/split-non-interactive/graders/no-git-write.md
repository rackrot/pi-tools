---
type: regex
pattern: '"command":"(?:\\.|[^"\\])*(\bgit (commit|add|checkout|reset|stash|rebase|switch)\b|jj (split|squash)\b[^"\\&;|]*\s(-i|--interactive)\b)'
match: not_contains
target: trace
---
