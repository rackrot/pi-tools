---
name: route-implicit-ship-merged-work
description: "Implicit trigger: the user never says 'release' or names fj; merged work on a Codeberg repo has to go out as a new version with a downloadable tarball."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

everything for 0.9.0 is merged on main now (repo is codeberg.org/acme/widgets, last tag was v0.8.2). can you get it out the door? people grab the linux tarball from the downloads page so dist/widgets-linux-amd64.tar.gz has to end up there too, and write up what changed.
