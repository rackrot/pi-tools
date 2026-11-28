---
type: regex
pattern: '^\W*LOGIN:\W*aws login\b[^|\n]*\|\W*MIN_CLI:\W*v?2\.32(?:\.0)?\b(?!\.)'
flags: im
weight: 1
target: last_message
---
