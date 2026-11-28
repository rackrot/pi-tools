---
type: regex
pattern: '^[\s>*\-`]*C\**\s*:.*gh pr create\b.*\s(--draft|-d)\b'
flags: im
weight: 1
target: last_message
---
