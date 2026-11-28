---
name: value-report-divergence-first
description: "Value case, manual invocation. The fresh reads are already collected and pasted in; four of five land near the session's direction and one questions a premise it rests on, which the given facts neither confirm nor refute. The user leans on the 4 to 1 count. The skill reports the premise challenge first, then the reads that add to the direction, then the convergent ones, and never counts votes or calls the direction confirmed; a bare model leads with the agreement and cites the count."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:tunnel-check I already ran the fresh reads in clean sessions, so skip the fan-out and write up the result from the five answers below. There are no files to open. Looks like 4 of 5 back us, so I mostly need the write-up to paste into the design doc as the justification.

Our direction: the nightly export of the orders table times out, so we split it into per-day chunks and run the chunks in parallel on 4 workers.

What each read got: "A nightly job exports the orders table (about 40 million rows) to CSV for the finance team and has started hitting its 2 hour limit. Goal: finish reliably within 2 hours. Constraints: same database, no new infrastructure, finance needs one file per night."

- R1: Split the export into date ranges and run several ranges at once, then concatenate the parts.
- R2: Chunk by day and parallelise across a few workers. Read from a consistent snapshot, otherwise rows that change during the run can land in two chunks or in none.
- R3: Partition the work by created date, run the partitions concurrently, merge at the end.
- R4: Before speeding up a full export I would ask whether finance needs all 40 million rows every night. If they only use what changed since yesterday, the job should export a delta and no parallelism is needed.
- R5: Chunk by day and run chunks in parallel, but cap the concurrency: unbounded export workers can starve the database for the other nightly jobs.

End your reply with exactly two lines. First `ORDER: ` followed by the five read ids in the order your write-up presents them, comma separated (for example `ORDER: R1, R2, R3, R4, R5`). Then `SUMMARY: ` followed by one sentence saying what the five reads mean for our direction.
