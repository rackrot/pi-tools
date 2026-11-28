---
name: value-sbt2-migration-facts
description: Value case. Three sbt 2 behaviours that differ from sbt 1 (bare settings are common settings, testFull instead of the cached test, automatic reload); the bare model answers with sbt 1 habits.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we moved a multi-project build (root aggregating `core` and `api`) from sbt 1.10.7 to sbt 2.0.11 last week and three things confuse me. no custom tasks, no extra plugins, default settings everywhere.

1. build.sbt has a bare line at the top level, outside any `.settings(...)`: `scalacOptions += "-Werror"`. on 2.0.11, which projects get that flag: only the root project, or root plus core and api?
2. the nightly job runs `sbt "clean ; test"` and suites that were green yesterday are not executed at all. which single built-in task do I put in place of `test` so every suite really executes every night?
3. on 1.10.7 I had to type `reload` after every build.sbt edit before the change showed up. on 2.0.11, do I still have to run `reload` myself after editing build.sbt, before the next command?

end your reply with exactly three lines, nothing after them. A1 is the single word ROOT_ONLY or the single word ALL_PROJECTS. A2 is the task name only. A3 is the single word YES or the single word NO.

```
A1: <one word>
A2: <task name>
A3: <one word>
```
