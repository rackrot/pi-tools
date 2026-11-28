---
type: regex
pattern: 'BRIEF START(?:(?!BRIEF END|send-guard|send guard|fencing|SET\s*NX|\bTTL\b|redis[^\n]{0,40}\block|\block[^\n]{0,40}redis)[\s\S])+BRIEF END'
flags: i
weight: 2
target: last_message
---
