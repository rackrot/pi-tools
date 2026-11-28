---
type: regex
pattern: '^[\s>*\-]*C2\**\s*:\s*[`*]*\s*NO\b[`*,;\s-]*(-D)?maven\.test\.skip(=true)?[`*]*\s*$'
flags: im
weight: 1
target: last_message
---
