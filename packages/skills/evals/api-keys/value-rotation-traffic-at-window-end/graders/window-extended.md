---
type: regex
pattern: '^[\s>*\-]*ANSWER\**\s*:\s*\**\s*\(?B\b(?![\s\S]*^[\s>*\-]*ANSWER\**\s*:\s*\**\s*\(?[ACD]\b)'
flags: im
weight: 1
target: last_message
---
