---
name: route-implicit-bad-release-spreading
description: Implicit trigger. A bad Android release that is partway out to users and must be stopped is a rollout halt, with no mention of Play, tracks or staged rollouts.
tags: [trigger]
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we pushed 3.2 of our android app out to a fifth of our users on monday and the one-star reviews about it crashing on launch are piling up. the fix is two days away. how do I stop more people from getting 3.2 in the meantime, and can I shrink it back to fewer users? pulling the app from the store is not an option.
