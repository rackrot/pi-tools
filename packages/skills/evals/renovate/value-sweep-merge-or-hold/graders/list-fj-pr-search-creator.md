---
type: regex
pattern: '^[\s>*\-`]*LIST\**\s*:[^\n]*\bfj pr\b[^\n]*\bsearch\b[^\n]*(\s-c|\s--creator)[ =]["`]?renovate-bot\b'
flags: im
weight: 2
target: last_message
---
