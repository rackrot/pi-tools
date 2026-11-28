---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?Node(\.js)?\s*16'
flags: im
match: not_contains
weight: 1
target: last_message
---
