---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?\]\(\s*(\./)?docs/config-reference\.md\s*\)'
flags: im
weight: 3
target: last_message
---
