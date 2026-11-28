---
type: regex
pattern: '^[\s>*\-]*COUNT FIELD\**\s*:[\s*`]*\w+\s*:\s*Int\b(?!\s*!)'
flags: im
weight: 1
target: last_message
---
