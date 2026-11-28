---
type: regex
pattern: 'BEGIN SETUP\.md(?=(?:(?!END SETUP\.md)[\s\S])*?25\s*MB)(?=(?:(?!END SETUP\.md)[\s\S])*?100\s*MB)'
flags: im
weight: 1
target: last_message
---
