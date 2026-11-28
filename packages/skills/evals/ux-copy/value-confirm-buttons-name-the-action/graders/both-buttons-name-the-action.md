---
type: regex
pattern: '^\W*BUTTONS\W*(?![^\n]*\b(?:Cancel|OK|Okay|Yes|No|Close|Dismiss|Back|Never ?mind|Confirm)\b)[^\n|]+\|[^\n|]+$'
flags: im
weight: 3
target: last_message
---
