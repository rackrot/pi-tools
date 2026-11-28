---
type: regex
pattern: '^[\s>*\-`]*A\**\s*:.*gh pr create\b.*\s(--draft|-d)\b'
flags: im
weight: 1
target: last_message
---
