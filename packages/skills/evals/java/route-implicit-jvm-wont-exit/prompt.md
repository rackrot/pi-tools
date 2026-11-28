---
name: route-implicit-jvm-wont-exit
description: Implicit trigger. A batch process that never exits because of a thread pool nobody shuts down; no file, no code, the word Java is never used.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our nightly report job finishes its work, logs "done", and then the process just sits there until the scheduler kills it an hour later. main() has returned by then. the only thing we changed last week is that ReportRunner now renders the PDFs on a fixed thread pool of 8 (Executors.newFixedThreadPool) and waits on the futures before logging. why doesn't the JVM exit and what's the proper fix?
