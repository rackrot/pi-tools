---
name: route-negative-codeberg-release
description: "Near miss: the same manual release job, but the remote is Codeberg, which belongs to forgejo-release."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

time for the next version of our cli. the repo is codeberg.org/acme/stowaway, last tag v0.6.3, about 15 commits on main since and no release tooling. work out the version number, write the notes from what changed, then tag it and put it on the repo's releases page.
