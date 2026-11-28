---
type: regex
pattern: 'cannot oversell|can.?t oversell|will not oversell|atomic|my conclusion|author(?:.s)? (?:claim|conclusion|belie)'
flags: i
match: not_contains
weight: 1
target: last_message
---
