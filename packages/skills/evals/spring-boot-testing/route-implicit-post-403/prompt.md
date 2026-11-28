---
name: route-implicit-post-403
description: Implicit routing case. A controller test whose mock POST and DELETE come back 403 while GETs pass (missing csrf()) should load spring-boot-testing; the prompt names no annotation, slice or skill.
tags: [trigger, implicit]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

something's off in my controller tests for the admin API. the test logs in a fake admin user, and every GET test passes, but the tests that POST or DELETE all come back 403 Forbidden. same calls work fine against the running app from the admin UI, and the fake user has the same role I use there. Spring Boot 3.5 with the security starter. what am I missing in the tests?
