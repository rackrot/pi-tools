---
name: value-pre-gap-excluded
description: "Value case. The prompt types /skill:catchup (pi expands it inline; the bare arm sees it as plain text). Five dated facts in chronological order, one from before the owner's last commit, and two project terms of which the owner coined one. The skill decides the briefing: the item that needs the owner first, nothing from before the last touch, and New words skips a term the owner used themselves. Measured on Haiku: the bare model already puts the blocked item first and lists only the agent's term, so those two graders weigh 1 each as guards; it never leaves the pre-gap fact out, which carries the weight (4)."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:catchup where does the exporter stand

I can't reach the repo from this laptop, so I copied what I could out of the git log and the plan file. My own last commit was on 3 June, "add shadow table for invoices"; I haven't looked at anything since and the agent kept going on its own. These five are all I have.

- A. 1 June, commit 3c9d1e: the PDF renderer was swapped from wkhtmltopdf to headless Chromium.
- B. 5 June, commit 5e6f7a: export jobs now read from the shadow table instead of the live invoices table.
- C. 7 June, docs/plans/exporter.md section 2: the agent started calling the nightly reconciliation pass the "sweep" and uses the word everywhere since.
- D. 9 June, commit 8b9c0d: export chunk size changed from 1000 to 250 rows.
- E. 10 June, Status block in docs/plans/exporter.md: "BLOCKED on owner: rotate the export bucket key now (partner downloads break for about an hour) or wait for the 1 July maintenance window?"

After the briefing, end with exactly these three lines so I can check it against my notes:

ORDER: <the letters of the facts in the order your briefing presents them, comma separated>
LEFT OUT: <letters of facts you did not put in the briefing, or none>
NEW WORDS: <the terms your briefing explains as new vocabulary, comma separated, or none>
