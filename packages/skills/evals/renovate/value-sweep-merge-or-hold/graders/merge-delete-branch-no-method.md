---
type: regex
pattern: '^(?![^\n]*(--method|\s-M\s))(?=[^\n]*\b41\b[^\n]*$)(?=[^\n]*(\s--delete\b|\s-d\b))[\s>*\-`]*MERGE41\**\s*:[^\n]*\bfj pr\b[^\n]*\bmerge\b'
flags: im
weight: 2
target: last_message
---
