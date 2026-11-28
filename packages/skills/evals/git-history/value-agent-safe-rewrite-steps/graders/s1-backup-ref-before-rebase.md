---
type: regex
pattern: '^[\s>*\-]*S1\**\s*:\s*[`*]*\s*git (?:branch|tag)\s+(?!-)\S+'
flags: im
weight: 1
target: last_message
---
