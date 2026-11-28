---
name: route-implicit-lockfile-new-packages
description: "Routing, implicit. A PR review question about a pnpm-lock.yaml diff that brings in three packages nobody asked for, one with a postinstall; routes to dependency-vetting although the user only asks whether the PR can be merged."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

reviewing a PR that only bumps `eslint-config-acme` from 4.1.0 to 4.2.0, but the pnpm-lock.yaml diff also adds three packages that weren't in the tree before:

- `ansi-regexp-utils@1.0.2`
- `is-odd-number@3.1.0`
- `node-fetch-commonjs2@0.0.9`

the npm page for the last one says it has a postinstall that runs `node setup.js`, and its first release was four days ago. CI is green. is this ok to merge, and what should I do before I check the branch out and run `pnpm install` locally?
