---
type: regex
pattern: '^[\s>*\-]*T1\**\s*:\s*\**\s*YES\b[\s\S]*?^[\s>*\-]*T2\**\s*:\s*\**\s*NO\b[\s\S]*?^[\s>*\-]*T3\**\s*:\s*\**\s*YES\b[\s\S]*?^[\s>*\-]*T4\**\s*:\s*\**\s*NO\b[\s\S]*?^[\s>*\-]*T5\**\s*:\s*\**\s*NO\b[\s\S]*?^[\s>*\-]*T6\**\s*:\s*\**\s*YES\b'
flags: im
target: last_message
---
All six verdicts must be right: T1 YES, T2 NO, T3 YES, T4 NO, T5 NO, T6 YES. One grader on purpose: the bare model gets the four easy ones right, so per-line graders would hide the difference.
