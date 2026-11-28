---
name: value-boot41-build-and-binding-changes
description: Value case. Three Boot 4.1 changes (layertools jar mode, -DskipTests and Maven AOT, Optional constructor binding) where the bare model invents spring-boot.aot.skip and says Optional was always empty.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

three things in our Spring Boot 3.5 service I need a yes/no on before we move it to Boot 4.1 (Maven build, native image profile with AOT):

- C1: the Dockerfile runs `java -Djarmode=layertools -jar app.jar extract`. Does that jar mode still exist on 4.1, and if not which jar mode do we use?
- C2: the PR pipeline runs `./mvnw -Pnative -DskipTests package` to keep it fast, and today that also skips AOT processing. On 4.1, does `-DskipTests` still skip AOT processing? If not, which user property do we pass instead to skip both?
- C3: `@ConfigurationProperties("app.mail") record MailProps(String from, Optional<String> replyTo) {}` and nobody sets `app.mail.reply-to`. Is `replyTo()` `null` or `Optional.empty()` today on 3.5, and which is it on 4.1?

End your reply with exactly three lines in this form, nothing else on those lines:
`C1: <YES or NO> <jar mode to use>`
`C2: <YES or NO> <property name>`
`C3: <NULL or EMPTY on 3.5> <NULL or EMPTY on 4.1>`
