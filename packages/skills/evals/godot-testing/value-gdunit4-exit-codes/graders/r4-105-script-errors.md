---
type: regex
pattern: '^[\s>*\-]*R4\**\s*:\s*[*`]*\s*(?:105\s*\S{1,2}\s*)?SCRIPT[_ ]ERRORS\b'
flags: im
weight: 1
target: last_message
---
