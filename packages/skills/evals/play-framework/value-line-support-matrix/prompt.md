---
name: value-line-support-matrix
description: "Value case. The Play line table (SKILL.md): 2.9 drops Scala 2.12 and Java 8 and is the last line on com.typesafe.play; 3.0 is org.playframework only, still runs on Java 11 and still accepts javax.inject. A bare model tends to keep 2.12 on 2.9 or to demand Java 17 / jakarta.inject on 3.0."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm auditing the Play services we inherited to see which ones are on a combination the framework actually supports and which need work before anything else. I can't run sbt on them right now, so I need your read from the build facts alone. Each service is described fully below; assume everything not mentioned is fine.

- B1: sbt-plugin `com.typesafe.play` 2.9.5, `scalaVersion := "2.12.19"`, runs on Java 17.
- B2: sbt-plugin `com.typesafe.play` 2.9.5, `scalaVersion := "3.3.3"`, runs on Java 11.
- B3: `addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "3.0.5")`, Scala 2.13.14, Java 17.
- B4: sbt-plugin `org.playframework` 3.0.5, Scala 2.13.14, runs on Java 11.
- B5: sbt-plugin `org.playframework` 3.0.5, Scala 3.3.3, Java 21; every controller imports `javax.inject.Inject` and `javax.inject.Singleton`.
- B6: sbt-plugin `com.typesafe.play` 2.8.22, Scala 2.12.19, runs on Java 8.

For each one answer OK (a supported combination for that Play line that resolves and builds as described) or BROKEN (it cannot resolve or build like this, or the Play line does not support that Scala or Java version). "Old but still valid for its line" is OK. Explain briefly if you like, then end your reply with exactly these six lines and nothing after them:

B1: OK or BROKEN
B2: OK or BROKEN
B3: OK or BROKEN
B4: OK or BROKEN
B5: OK or BROKEN
B6: OK or BROKEN
