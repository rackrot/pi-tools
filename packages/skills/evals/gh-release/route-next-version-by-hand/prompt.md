---
name: route-next-version-by-hand
description: "Positive trigger: a GitHub library with no release automation needs its next version worked out, written up in CHANGELOG.md, tagged and put on the Releases page."
tags: [routing]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

github.com/acme/tinycsv is a small Go library, one module, and we have no release automation at all, I do it by hand maybe twice a year and always forget the steps. last tag is v1.3.2 and there are about 20 commits on main since. can you take me through getting the next version out: what number it should be, the CHANGELOG.md entry, the tag and the entry on the Releases page.
