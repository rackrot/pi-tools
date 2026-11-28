---
name: value-detect-and-resolve-durations
description: "Value case. Header durations from a timeline. The skill defines time to detect as first symptom to detection and time to resolve as detection to full resolution, and wants times in UTC; the bare model tends to measure resolve from the first symptom or up to the mitigation and to keep local time."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

filling in the header of the incident write-up for Tuesday's queue backlog, 2024-03-12. times below are from our chat export, which is in New York time (EDT, UTC-4).

- 10:02 consumer lag starts climbing on the orders queue (seen later on the dashboard, nobody noticed then)
- 10:31 lag alert fires
- 10:35 on-call acks the page
- 10:40 incident declared
- 11:05 cause found: a consumer deploy at 09:58 halved the batch size
- 11:20 deploy rolled back, lag starts dropping
- 12:10 backlog drained, all orders processed
- 12:25 support emails the affected merchants that it is over

I need three values for the header: time to detect, time to resolve, and the time of the first timeline entry the way it should appear in the document.

end your reply with exactly these three lines, minutes as plain integers and the time as HH:MM:
TTD: <minutes>
TTR: <minutes>
FIRST: <HH:MM>
