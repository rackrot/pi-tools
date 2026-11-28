---
name: value-rotation-traffic-at-window-end
description: "Value case. On a routine roll with requests still arriving on the old key shortly before its chosen end, the window is extended instead of cutting a live consumer off (references/storage-and-rotation.md, rotation step 4; SKILL.md Rotate section). The bare model cuts the key off on schedule."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

One behaviour to settle for the API keys our platform issues to customer orgs.

A customer rolled a key last week as routine hygiene (no leak) and chose a 7-day end date for the old key. A few hours before that end date the old key is still receiving steady requests from one of their job runners. What does the platform do with the old key?

- A: It is cut off at the chosen time; they picked the date.
- B: Its window is extended and the customer is told which caller is still on it.
- C: It is cut off now, early, to force the last caller over.
- D: It is deleted at the chosen time so it cannot be re-enabled.

End your reply with exactly one line in the form `ANSWER: <letter>`.
