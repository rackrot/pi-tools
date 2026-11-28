---
name: route-implicit-piped-output-and-exit-status
description: "Routing, implicit. A Go command-line tool whose progress text pollutes piped output, that exits 0 on failure and ignores Ctrl-C, routes to golang-cli without naming cobra, viper or any API."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we ship a small Go command-line tool, `shipctl`, with a handful of subcommands. three complaints from the ops team this week: `shipctl list | jq .` blows up because the "fetching 3/10..." progress lines end up in the pipe, their deploy script keeps going after `shipctl push` fails because the exit status is still 0, and Ctrl-C during `shipctl watch` does nothing until the current poll finishes. how should main and the subcommands be structured so all three are fixed properly and I can cover them with tests?
