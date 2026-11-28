---
type: regex
pattern: '^[\s>*\-]*REVIEWS\**\s*:\s*\**\s*`?fj pr (?:-R|--remote)[ =]upstream review 12 list(?=[^\n]*(?:--comments|\s-c\b|\s-(?:ac|ca)\b))(?=[^\n]*(?:--all|\s-a\b|\s-(?:ac|ca)\b))'
flags: im
weight: 1
target: last_message
---
