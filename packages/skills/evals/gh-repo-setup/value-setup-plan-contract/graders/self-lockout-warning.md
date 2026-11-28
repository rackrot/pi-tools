---
type: regex
pattern: 'lock\w*[ -]?out|(block|appl\w+|bind)s?\b[^.\n]{0,60}\b(you|admins?|yourself|mkovac)\b|\b(you|admins?|mkovac)\b[^.\n]{0,60}\b(blocked|bound|bypass)'
flags: i
weight: 1
target: last_message
---
