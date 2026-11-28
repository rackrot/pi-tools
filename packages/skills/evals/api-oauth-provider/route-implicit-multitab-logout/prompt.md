---
name: route-implicit-multitab-logout
description: Implicit trigger. A refresh-rotation symptom on the token endpoint we operate (multi-tab users logged out by reuse detection) routes to api-oauth-provider without naming OAuth design, grants or the skill.
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Partner apps that integrate with our platform keep complaining that their users get kicked out and have to reconnect their account. We traced it: when someone has the partner app open in two tabs, both tabs send the same refresh token to our token endpoint at almost the same moment, we treat the second one as a replay and revoke everything for that user. We don't want to turn replay detection off. What should our token endpoint do instead?
