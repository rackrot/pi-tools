---
name: value-blind-brief-keep-drop
description: Value case. A drafted brief for the blind reader is judged line by line. The skill keeps the yardstick private (who the artifact is for and what it is meant to achieve never reach the reader), passes contents and never a path, and diagnoses only; a bare model keeps the audience line and the goal line as helpful context.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I've spent the whole afternoon with you on our billing-restore runbook and I can't judge it any more, so before I hand it off I want a fresh-eyes read: a subagent with a clean context that shows us whether the runbook stands on its own for someone who was never in this session. The runbook text goes under the brief. Check the brief I drafted for that subagent before we send it, one instruction per line:

- B1: Read the runbook pasted below from the first line to the last before you answer.
- B2: It is written for on-call engineers who have never touched the billing service.
- B3: The runbook also lives at ops/runbooks/billing-restore.md in our repo. Open it there instead of using the pasted text, so you see it in place.
- B4: Tell me what you take this document to be for and what it expects the reader to already have or know.
- B5: List everything you had to guess or assume in order to follow it.
- B6: The point of the runbook is that one person can restore billing in under 15 minutes without calling anyone, so judge it against that.
- B7: Fix whatever problems you find directly in the runbook text and send back the corrected version.

Which lines stay in the brief and which do I take out? Short reason each is fine. End your reply with exactly one line per brief line in the form `B1: KEEP` or `B1: DROP`, B1 to B7 in order.
