---
type: regex
pattern: 'BEGIN faq(?:(?!END faq)[\s\S])*?^[^\n]*Print[^\n]*\n\s*[^\n]*Print[^\n]*\n\s*[^\n]*Print'
flags: im
weight: 1
target: last_message
---
