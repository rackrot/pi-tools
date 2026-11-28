---
name: value-trace-or-dump-first
description: Value case. Which artifact to collect first per symptom; the skill says a hang starts with a thread-time trace (dump only if that does not explain it), GC pressure needs a trace, and RSS growth with a flat managed heap is a native leak that a heap dump will not show. The bare model tends to answer DUMP for the hang and the native leak.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

four of our .NET 8 services (all on Linux VMs, I have root) are misbehaving and I get one short capture window on each tonight, so for each one I need to know what to collect FIRST: a trace or a process dump. I know how to run the tools, I only need the choice.

- S1: payments worker. A few times a week it stops making progress: process alive, queue not draining, no log output. Nobody knows yet whether it is a deadlock or something else.
- S2: catalog API. The managed heap (gen2) climbs for hours and never comes back down.
- S3: search API. Memory is stable, but dotnet-counters shows about 40% time in GC and throughput has halved.
- S4: image resizer. dotnet-counters shows the GC heap flat at around 300 MB all day, but the process RSS grows by about 2 GB a day.

end your reply with exactly one line per service in the form `S1: TRACE` or `S1: DUMP`, S1 to S4 in order.
