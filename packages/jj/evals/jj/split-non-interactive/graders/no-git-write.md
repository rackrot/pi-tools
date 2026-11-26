---
type: regex
pattern: '"command":"(?:\\.|[^"\\])*(\bgit (commit|add|checkout|reset|stash|rebase|switch)\b|jj (split|squash) (-i|--interactive))'
match: not_contains
target: trace
---
