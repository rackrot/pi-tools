---
type: regex
pattern: '^[\s>*\-]*LOG-COMMAND\**\s*:\s*[`*]*\s*(aws\s+)?(logs\s+)?start-query\b'
flags: im
weight: 2
target: last_message
---
