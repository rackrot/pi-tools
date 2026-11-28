---
type: regex
pattern: '^[\s*#`]*ARTIFACT\b[*`]*:[\s\S]*balance = balance \+[\s\S]*^[\s*#`]*CONTRACT\b[*`]*:[\s\S]*(?:exactly once|exactly-once|only once|once and only once)'
flags: im
weight: 1
target: last_message
---
