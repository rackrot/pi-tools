---
name: route-negative-pekko-http-service
description: "Near miss: moving a standalone Akka HTTP service (no Play, no conf/routes, no sbt-plugin) to Apache Pekko. The play-framework description mentions Akka to Pekko, but only as part of the Play 3.0 upgrade; this prompt belongs to scala/sbt or to no skill."
tags: [routing, negative]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our ingest service is a small standalone Scala app: an `object Main extends App` that starts `Http().newServerAt("0.0.0.0", 8080).bind(routes)` with the Akka HTTP routing DSL (`path("events") { post { entity(as[Event]) { ... } } }`) and one typed actor behind it. No web framework on top, just akka-http 10.2 and akka-actor-typed 2.6.20 in build.sbt. Legal wants us off Akka because of the licence change, so we're going to Apache Pekko. Which dependencies replace these two, what do the imports become, and does the `akka { ... }` block in application.conf need to change?
