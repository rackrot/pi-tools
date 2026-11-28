---
type: regex
pattern: 'SKIP\s*=\s*\S+\s+git\s+commit|git\s+commit\b[^\n]*--no-verify|git\s+-c\s+core\.hooksPath'
flags: i
match: not_contains
weight: 1
target: last_message
---
