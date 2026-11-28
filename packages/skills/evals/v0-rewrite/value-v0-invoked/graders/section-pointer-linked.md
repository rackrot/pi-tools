---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?\]\(\s*#limits\s*\)'
flags: im
weight: 2
target: last_message
---
