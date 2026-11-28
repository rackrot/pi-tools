---
type: regex
pattern: '^[\s*#`]*ARTIFACT\b[*`]*:[\s\S]*reserve_stock[\s\S]*^[\s*#`]*CONTRACT\b[*`]*:[\s\S]*(?:below zero|negative|50)'
flags: m
weight: 1
target: last_message
---
