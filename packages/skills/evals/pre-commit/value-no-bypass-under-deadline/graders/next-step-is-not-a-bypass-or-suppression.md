---
type: regex
pattern: '^[\s>*\-]*NEXT\**\s*:(?![^\n]*(no-verify|SKIP\s*=|hooksPath|commit\s[^\n]*\s-n\b|type:\s*ignore|exclude))[^\n]*\S'
flags: im
weight: 1
target: last_message
---
