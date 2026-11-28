---
type: regex
pattern: '^[\s>*\-]*R3\**\s*:\s*[*`]*\s*(?:100\s*\S{1,2}\s*)?TEST[_ ]FAILURES\b'
flags: im
weight: 1
target: last_message
---
