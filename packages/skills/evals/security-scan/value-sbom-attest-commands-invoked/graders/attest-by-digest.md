---
type: regex
pattern: 'cosign attest\b(?:(?!cosign verify)[\s\S])*?@(sha256:|\$\{?\{?[^\n]*digest)'
flags: i
weight: 3
target: last_message
---
