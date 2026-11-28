---
type: regex
pattern: '^[\s>*\-`]*VERDICTS GIVEN\**\s*:\s*\**\s*[2-5]\b(?!\s*[-–]|\s*to\b)'
flags: im
weight: 1
target: last_message
---
