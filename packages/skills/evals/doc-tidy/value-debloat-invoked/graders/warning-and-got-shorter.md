---
type: llm
weight: 3
focus: { source: file, path: OPERATIONS.md }
---

Judge the final OPERATIONS.md. The original was about 175 words of padded prose carrying exactly three facts (the service listens on port 8443, logs are kept 14 days, the maximum upload is 25 MB) and one warning (never run `reset-db` against the production database; it drops every table and cannot be undone).

PASS only if both hold:
1. The file still states all three facts and the warning, including the reason it is destructive and the production scope.
2. The file is clearly shorter than the original, under about 120 words, and still reads as ordinary prose or a list.

FAIL if any fact or the warning is missing or its scope is weakened, or if the file is not materially shorter. Do not reward additions or commentary inside the file.
