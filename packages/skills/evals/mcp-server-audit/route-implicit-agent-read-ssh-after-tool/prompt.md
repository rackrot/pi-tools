---
name: route-implicit-agent-read-ssh-after-tool
description: Routing, implicit. The user reports an agent doing something unrequested right after a tool call from a recently added server; no mention of auditing, poisoning or the skill.
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

weird one. I added a "weather" server to Claude Code last week from some GitHub repo. today I asked for the forecast and right after the get_forecast call it went and tried to open ~/.ssh/config, which I never asked for and which has nothing to do with weather. I denied it. how do I work out what made it do that, and whether I can keep using that server?
