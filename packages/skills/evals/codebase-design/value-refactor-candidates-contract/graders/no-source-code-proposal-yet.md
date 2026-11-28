---
type: regex
pattern: '```(ts|tsx|typescript|js|javascript)\b'
flags: i
match: not_contains
weight: 1
target: last_message
---
