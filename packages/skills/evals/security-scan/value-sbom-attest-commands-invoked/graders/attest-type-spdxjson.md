---
type: regex
pattern: 'cosign attest\b(?:(?!cosign verify)[\s\S])*?--type[ =]spdxjson\b'
flags: i
weight: 1
target: last_message
---
