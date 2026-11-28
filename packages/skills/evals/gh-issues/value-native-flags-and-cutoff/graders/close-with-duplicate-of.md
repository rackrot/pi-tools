---
type: regex
pattern: '^[\s>*\-`]*DUPLICATE_CLOSE\**\s*:[\s*`]*gh issue close\b[^\n]*--duplicate-of[ =]"?#?120\b'
flags: im
weight: 1
target: last_message
---
