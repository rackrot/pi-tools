---
name: value-forgejo-rendering-facts
description: Value case. Two Forgejo-specific README facts a model carrying GitHub habits gets wrong, which README folder is shown when the root has none, and the release badge route the instance serves itself.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We just moved tidepool from GitHub to Codeberg (https://codeberg.org/acme/tidepool) and I'm getting the README ready before we announce it. Two things I'm stuck on:

1. Right now there is no README in the repo root. There is a docs/README.md and a different .github/README.md. Which of the two will Codeberg show on the repo's home page?
2. I want a latest-release badge under the title that the Codeberg instance serves itself, not a shields.io URL I build by hand. What is the image URL?

End your reply with exactly these two lines, filled in, and nothing after them:

SHOWN: docs/README.md or .github/README.md
BADGE: <full image URL>
