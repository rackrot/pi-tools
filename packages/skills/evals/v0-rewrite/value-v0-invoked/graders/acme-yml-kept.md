---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?acme\.yml'
flags: im
weight: 1
target: last_message
---
