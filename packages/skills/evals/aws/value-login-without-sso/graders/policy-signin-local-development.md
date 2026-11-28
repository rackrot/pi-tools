---
type: regex
pattern: '^\W*LOGIN:[^\n]*\|\W*POLICY:\W*(?:arn:aws:iam::aws:policy/)?SignInLocalDevelopmentAccess\b'
flags: im
weight: 3
target: last_message
---
