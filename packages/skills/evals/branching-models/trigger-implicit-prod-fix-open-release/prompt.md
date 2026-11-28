---
name: trigger-implicit-prod-fix-open-release
description: Implicit positive. A production fix while a release branch is open, described by its branches (develop, release/3.2.0) without the words git-flow or hotfix; the branching-model skill owns where the fix branches from and where it lands.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

prod is running 3.1.0 and customers are hitting a crash in the csv importer. we cut release/3.2.0 off develop on monday and QA is still working through it. I have the fix ready locally. where do I branch from, what version number does it get, and which branches does the fix have to land in when I'm done?
