---
name: route-quiet-implicit-sidebar-drift
description: "In scope but manual, implicit phrasing: a nav listing that drifted because entries were appended where they were written, with no word like reorder, sort or order. reorder has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our docs sidebar (docs/_sidebar.md) has turned into a junk drawer. "Uninstall" sits above "Install", the three backup pages are nowhere near each other, and "Getting started" is ninth. The page titles and links are all correct, people just cannot find anything. Fix it, and the German sidebar in docs/de/_sidebar.md has the same problem.
