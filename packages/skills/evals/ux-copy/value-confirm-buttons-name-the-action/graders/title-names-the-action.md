---
type: regex
pattern: '^\W*TITLE\W*(?![^\n]*are you sure)[^\n]*\bDelete\b[^\n]*\binvoices\b'
flags: im
weight: 1
target: last_message
---
