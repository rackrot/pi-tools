---
name: value-eval-mode-tracking-defaults
description: Value case. GOFF-specific provider behaviour a bare model guesses wrong. In-process is the default evaluation mode, a generic OFREP provider cannot forward track(), GOFF providers can, the Android provider polls every 5 minutes, and gofeatureflag.currentDateTime overrides the clock.
tags: [value]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

we are moving four apps to GO Feature Flag behind one relay proxy (current version, with an exporter configured for both feature and tracking events). before I write the rollout doc I need these settled:

- Q1: the Node API uses `@openfeature/go-feature-flag-provider` and we pass only `endpoint`. Does every `getBooleanValue` call make an HTTP request to the proxy? YES or NO.
- Q2: the Rust worker uses the `open-feature-ofrep` crate pointed at the proxy. Will custom tracking events sent with the OpenFeature track call reach the proxy's exporter? YES or NO.
- Q3: the Python service uses `gofeatureflag-python-provider` with default options. Will `client.track(...)` events reach the proxy's exporter? YES or NO.
- Q4: the Android app uses the GOFF Kotlin provider with default options. The proxy has just loaded a newly added flag and the user's context does not change. Counting from that moment, after at most how many minutes does the app pick the flag up? A whole number.
- Q5: in an integration test I want a scheduled rollout step dated next month to apply now, without editing the flag file or the machine clock. Which evaluation context key do I set? Give the full dotted key.

end your reply with exactly one line per question in the form `Q1: NO`, `Q4: 3`, `Q5: some.key`, Q1 to Q5 in order.
