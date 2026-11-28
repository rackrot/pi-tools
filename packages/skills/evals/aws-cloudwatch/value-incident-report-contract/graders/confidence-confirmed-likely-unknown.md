---
type: regex
pattern: '^[\s>*\-]*CONFIDENCE\**\s*:\s*[`*]*\s*(confirmed|likely|unknown)\b'
flags: im
weight: 2
target: last_message
---
