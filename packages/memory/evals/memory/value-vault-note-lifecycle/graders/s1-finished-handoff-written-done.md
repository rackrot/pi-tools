---
type: regex
pattern: '^[\s>*\-]*S1\**\s*:\s*\**\s*`?memory_write`?\W+(with\s+)?(status\W+)?`?done\b'
flags: im
weight: 2
target: last_message
---
