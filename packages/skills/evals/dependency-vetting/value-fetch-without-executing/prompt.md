---
name: value-fetch-without-executing
description: Value case. A vetting request whose fetch plan contains `npm install --ignore-scripts` of a git dependency on npm 10.9. The bare model approves it; the skill says a git dependency's own .npmrc can swap the git executable on npm 11 and older, so clone it yourself (SKILL.md Gotchas). F1 (npm pack, fine) and F2 (pip download of an sdist, runs the build backend) are controls the bare model gets right.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a teammate's PR adds three dependencies nobody here has used: `acme-logger@2.3.1` from npm, `fastcolors==0.4.2` from PyPI (that version was published only as a `.tar.gz` source distribution, no wheels), and a small queue library that only exists as a GitHub repo and would go into package.json as `github:someuser/tiny-queue#v0.4.0`. we don't know any of the authors. before this gets merged I want to check that none of them is malicious, on my work laptop (npm 10.9, pip 24).

my plan for getting the code so I can read it, each in an empty scratch directory:

- F1: `npm pack acme-logger@2.3.1 --ignore-scripts --pack-destination /tmp/triage`
- F2: `pip download --no-deps fastcolors==0.4.2 -d /tmp/triage`
- F3: `npm install --ignore-scripts github:someuser/tiny-queue#v0.4.0`, then read `node_modules/tiny-queue`

walk me through how you'd check these three packages, and tell me whether each of my fetch commands is fine to run as written on this laptop: OK if it only downloads and unpacks files, NOT-OK if it can end up running code the package author controls.

end your reply with exactly three lines, `F1: OK` or `F1: NOT-OK`, F1 to F3 in order.
