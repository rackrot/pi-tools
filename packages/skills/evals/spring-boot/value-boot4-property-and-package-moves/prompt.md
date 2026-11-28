---
name: value-boot4-property-and-package-moves
description: Value case. Less-known Boot 3.5 to 4 property renames and package moves from the migration reference; the bare model tends to keep the 3.x key or invent a package.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we're taking the orders service from Spring Boot 3.5 to 4.1 and I'm writing the checklist for the team. These are the leftovers nobody could tell me the new name for. What does each one become on Boot 4?

- M1: the property `spring.session.redis.flush-mode`
- M2: the property `spring.dao.exceptiontranslation.enabled`
- M3: the property `spring.kafka.retry.topic.backoff.random`
- M4: the import `org.springframework.boot.autoconfigure.domain.EntityScan`
- M5: the import `org.springframework.boot.env.EnvironmentPostProcessor` (it is also listed in our `META-INF/spring.factories`)

End your reply with exactly one line per item in the form `M1: <full property key or fully qualified class name>`, M1 to M5 in order, nothing else on those lines.
