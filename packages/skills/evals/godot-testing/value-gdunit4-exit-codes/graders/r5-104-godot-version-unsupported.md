---
type: regex
pattern: '^[\s>*\-]*R5\**\s*:\s*[*`]*\s*(?:104\s*\S{1,2}\s*)?GODOT[_ ]VERSION[_ ]UNSUPPORTED\b'
flags: im
weight: 1
target: last_message
---
