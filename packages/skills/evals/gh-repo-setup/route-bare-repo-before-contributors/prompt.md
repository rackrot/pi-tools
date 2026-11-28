---
name: route-bare-repo-before-contributors
description: "Routing, explicit. A freshly pushed GitHub repo that has nothing but code, to be made ready for outside contributors, routes to gh-repo-setup."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we open-sourced acme/widgets on github last night and it's literally just the code and a readme. no bug report template, the default labels nobody ever looked at, nothing that says who reviews what or where to report a vulnerability. we announce it on monday and expect outside contributors. what's missing and what would you put in place, in what order? gh is logged in as me and i'm an admin on the repo.
