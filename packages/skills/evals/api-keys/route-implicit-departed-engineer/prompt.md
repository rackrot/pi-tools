---
name: route-implicit-departed-engineer
description: "Implicit trigger: a production integration running on a credential created by someone who left is an ownership and offboarding problem for api-keys."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Found out today that the credential our biggest customer's nightly sync uses to call our API was generated from the personal account of one of their engineers who left in March. It still works and nobody on their side knew it existed. What should our platform do differently so customers don't end up here?
