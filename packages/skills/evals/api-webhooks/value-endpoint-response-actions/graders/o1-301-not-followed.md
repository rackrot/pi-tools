---
type: regex
pattern: '^[\s>*\-]*O1\**\s*:\s*\**\s*`?(RETRY|DEADLETTER)\b'
flags: im
weight: 1
target: last_message
---
