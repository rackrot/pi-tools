---
name: route-implicit-terminal-client-after-github
description: "Routing, implicit. A team that moved from GitHub to a self-hosted Forgejo asks for a gh-like terminal client, how to install it and sign in, without naming fj. No narrower forgejo skill covers install and login, so it routes to forgejo-cli."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we moved our repos off GitHub last month to a self-hosted Forgejo at git.acme.dev. on GitHub I did everything from the terminal with gh. is there something equivalent I can use here? I'm on Fedora. tell me how to get it installed and signed in to our instance, I mostly want to list milestones and the repo's labels without opening the browser.
