---
type: regex
pattern: '^[\s>*\-]*TERMS\**\s*:(?![^\n]*(timeout|retry|storage|table|postgres))[^\n]*\border\b[^\n]*\binvoice\b'
flags: im
weight: 2
target: last_message
---
