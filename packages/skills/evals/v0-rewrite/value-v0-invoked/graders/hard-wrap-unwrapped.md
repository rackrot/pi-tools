---
type: regex
pattern: 'BEGIN SETUP\.md(?:(?!END SETUP\.md)[\s\S])*?(config-reference\.md\)?,? and the *\n|Limits\]?(\(#limits\))? section *\n *below)'
flags: im
match: not_contains
weight: 3
target: last_message
---
