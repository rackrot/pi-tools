---
name: route-new-pypi-package-before-add
description: "Routing, direct. A user asks whether a three-week-old PyPI package nobody on the team knows can be trusted before it goes into the project; routes to dependency-vetting without the words vet, malware or typosquat."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a teammate wants to pull `colorama-utils` from PyPI into our service (he found it in a blog post, pinned at 0.3.1). nobody here has heard of it, it first showed up on PyPI three weeks ago and has a single uploader. before I run `uv add colorama-utils==0.3.1`, how do I find out whether this thing can be trusted? give me the checks in the order you'd do them and the exact commands.
