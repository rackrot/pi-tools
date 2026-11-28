---
type: regex
pattern: '^[\s>*\-`]*ERROR_GOES_TO\**\s*:\s*[\*`]*\s*stderr\b'
flags: im
weight: 1
target: last_message
---
