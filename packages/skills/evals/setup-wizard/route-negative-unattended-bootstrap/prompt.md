---
name: route-negative-unattended-bootstrap
description: "Near miss: an unattended bootstrap script with no human steps and no secrets to collect is plain shell scripting (the bash skill), not a wizard for steps only a human can do."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Write scripts/bootstrap.sh for CI and fresh clones: install dependencies with pnpm, copy .env.example to .env if it is missing, run the database migrations, and exit non-zero if any step fails. It must run unattended, no prompts.
