---
name: route-quiet-wordy-contributing
description: "In scope but manual: an explicit request to cut a wordy doc down without losing rules. debloat has disable-model-invocation, so it must not load on its own; this fails if that flag is dropped without the case being turned into a positive trigger."
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

CONTRIBUTING.md has tripled in length over the last year and nobody reads it any more. Every rule in it still applies, I just want the same rules in far fewer words. Can you cut it down?
