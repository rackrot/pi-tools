---
type: regex
pattern: '^[\s>*\-]*C2\**\s*:\s*\**\s*MANUAL\b[\s\S]*^[\s>*\-]*C3\**\s*:\s*\**\s*AUTO\b'
flags: im
weight: 3
target: last_message
---
