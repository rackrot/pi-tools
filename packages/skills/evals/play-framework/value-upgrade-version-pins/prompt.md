---
name: value-upgrade-version-pins
description: "Value case. Version numbers from the references: Play 2.9 needs Java 11+ and sbt 1.9+ (references/migration.md), and scalatestplus-play is 6.x for Play 2.9 and 7.x for Play 3.0 (references/testing.md). A bare model tends to keep scalatestplus-play 5.x or guess the sbt floor."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm writing the ticket for our Play upgrade and need the version floors right before I hand it to the team. We're a Scala shop on Play 2.8.20, sbt 1.6.2, Java 8, with `"org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test`. The plan is 2.8 -> 2.9 first, then 2.9 -> 3.0 in a second ticket.

What I need to pin down:

1. the lowest Java major version Play 2.9 runs on
2. the lowest sbt 1.x minor that Play 2.9 needs
3. which scalatestplus-play major version goes with Play 2.9
4. which scalatestplus-play major version goes with Play 3.0

Explain briefly if you like, then end your reply with exactly these four lines and nothing after them, numbers only (for example `V2: 1.4`, `V3: 5`):

V1: <java major>
V2: <sbt 1.x minor, as 1.N>
V3: <scalatestplus-play major>
V4: <scalatestplus-play major>
