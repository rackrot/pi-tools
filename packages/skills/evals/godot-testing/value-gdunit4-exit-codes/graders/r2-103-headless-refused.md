---
type: regex
pattern: '^[\s>*\-]*R2\**\s*:\s*[*`]*\s*(?:103\s*\S{1,2}\s*)?HEADLESS[_ ]REFUSED\b'
flags: im
weight: 2
target: last_message
---
