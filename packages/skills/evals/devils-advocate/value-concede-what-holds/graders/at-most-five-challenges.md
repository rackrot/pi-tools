---
type: regex
pattern: '(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?(?:\*\*)?(?:Challenge[ \t]*)?6[.):]'
match: not_contains
weight: 2
target: last_message
---
