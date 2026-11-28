---
name: route-implicit-broke-after-tfm-bump
description: Implicit trigger. A run-time regression that appeared right after a TargetFramework bump from net9.0 to net10.0, with no mention of an upgrade guide or breaking changes, routes to dotnet-upgrade-guide.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

last week we changed TargetFramework from net9.0 to net10.0 in our importer (plain console app in a container, no host builder) and bumped the base image tag to match. it built fine and the tests are green, but since the deploy the pod gets SIGKILLed after the grace period on every rollout instead of exiting on its own like it used to, and the queue flush we do on exit never runs. nothing else in that release. what's going on?
