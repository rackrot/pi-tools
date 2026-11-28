---
type: regex
pattern: '^[\s>*\-]*R1\**\s*:\s*[*`]*\s*(?:101\s*\S{1,2}\s*)?WARNINGS[_ ]ONLY\b'
flags: im
weight: 2
target: last_message
---
