---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?(previously|updated:|no longer|~~)'
flags: im
match: not_contains
weight: 1
target: last_message
---
