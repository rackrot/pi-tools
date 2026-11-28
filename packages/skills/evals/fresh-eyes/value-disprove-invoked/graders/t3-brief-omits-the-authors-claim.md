---
type: regex
pattern: 'airtight|convinced|just resumes|resumes where it|author(?:.s)? (?:claim|conclusion|belie)|(?:crash|restart|re-?run)[^.\n]{0,60}\b(?:is|are) safe\b'
flags: i
match: not_contains
weight: 2
target: last_message
---
