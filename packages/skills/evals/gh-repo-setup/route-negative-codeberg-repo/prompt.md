---
name: route-negative-codeberg-repo
description: "Near miss. The same repo-baseline request, but the repo lives on Codeberg and the tool is fj; the description says GitHub only, so gh-repo-setup must not be read."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our project moved to codeberg last month (codeberg.org/acme/widgets, i use fj). the label list is a mess of duplicates from the import and there's no issue template yet. clean up the labels with fj and tell me where the issue template file goes on forgejo.
