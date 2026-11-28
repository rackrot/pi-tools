---
name: value-briefing-order
description: "Value case. Five dated facts are pasted in chronological order, one of them from before the owner's last commit. The skill's rules decide the briefing: the item that needs the owner goes first (decision order, not chronological), new words go after the changes, and anything before the owner's last touch stays out. The bare model tends to brief chronologically and keep the pre-gap fact as context."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I've been off the importer project for a while and lost the thread. I can't get at the repo from this machine, so I copied out of the git log and the plan file what I could. My own last commit was on 6 May ("freeze schema v3"); I haven't looked at anything since, the agent kept going on its own.

- A. 2 May, commit 1a2b9c: the CSV parser was replaced by a streaming parser.
- B. 9 May, commit 4d5e6f: default batch size changed from 500 to 2000.
- C. 11 May, docs/plans/importer.md section 3: the agent started calling the two-phase write "carve" and uses the word everywhere since.
- D. 12 May, commit 7a8b9c: the retry queue moved from Postgres to Redis.
- E. 14 May, Status block in docs/plans/importer.md: "BLOCKED on owner: drop the legacy_sessions table now (irreversible) or keep it 30 more days?"

Get me back in the picture from these five; they are all I have.

After the briefing, end with exactly these two lines so I can check it against my notes:

ORDER: <the letters of the facts in the order your briefing presents them, comma separated>
LEFT OUT: <letters of facts you did not put in the briefing, or none>
