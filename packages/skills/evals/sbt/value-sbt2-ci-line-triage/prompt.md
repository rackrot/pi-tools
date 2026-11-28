---
name: value-sbt2-ci-line-triage
description: Value case. Which CI command lines sbt 2 rejects (bare chain, delegated scoped key, colon syntax, filtered testFull) and which it runs; the bare model applies sbt 1 rules.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we just bumped project/build.properties from sbt.version=1.10.7 to sbt.version=2.0.11. nothing else changed. the build is a root project aggregating two subprojects, `core` and `api`, plain Scala 3, no custom tasks or configurations, no plugins beyond the defaults. `com.acme.ParserSpec` is a test suite in `core`.

these are the lines our CI and release scripts run, each from bash as written. before I push, tell me for each one whether sbt 2.0.11 accepts the line and runs the tasks (WORKS), or rejects the line itself with a parse error or an unknown command, key or task (FAILS). a failing test or compile error does not count as FAILS.

- L1: `sbt clean compile test`
- L2: `sbt "clean ; compile ; test"`
- L3: `sbt "core/Test/compile"`
- L4: `sbt "Compile/update"`
- L5: `sbt "test:compile"`
- L6: `sbt "testOnly com.acme.ParserSpec"`
- L7: `sbt "testFull *ParserSpec*"`

end your reply with exactly one line per command in the form `L1: WORKS` or `L1: FAILS`, L1 to L7 in order.
