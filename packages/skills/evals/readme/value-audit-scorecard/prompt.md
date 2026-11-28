---
name: value-audit-scorecard
description: "Value case. A README review where nothing can be executed. The skill's audit contract (references/audit-checklist.md) is a scorecard with Band A blocking checks and a Band B score out of 16, and it says an install command that was not run is reported as unverified, never as pass. A bare model writes a free-form review and takes the install line on trust."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Can you review the README of our Node library before we announce it? Repo is github.com/acme/retryq. I'm away from my laptop so the code isn't here and you can't run anything, the README below is all there is to go on. Readers are individual developers. Tell me whether it's fit to publish and what to fix first.

````markdown
# retryq

A retry queue for Node.js: failed jobs go back on the queue with exponential backoff.

[![CI](https://img.shields.io/github/actions/workflow/status/acme/retryq/ci.yml?branch=main)](https://github.com/acme/retryq/actions/workflows/ci.yml) [![npm](https://img.shields.io/npm/v/retryq)](https://www.npmjs.com/package/retryq) [![License](https://img.shields.io/github/license/acme/retryq)](LICENSE)

## Install

```sh
npm install retryq
```

## Usage

```js
import { Queue } from "retryq";

const q = new Queue({ retries: 5 });
q.add(() => fetch("https://example.com/flaky"));
await q.drain();
```

Battle-tested and blazing fast: handles 10k jobs per second.

## License

[MIT](LICENSE)
````
