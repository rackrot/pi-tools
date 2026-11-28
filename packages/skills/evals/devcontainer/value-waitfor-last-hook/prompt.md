---
name: value-waitfor-last-hook
description: "Value case. The user wants the editor to wait for the last lifecycle hook, which is postAttachCommand. waitFor accepts only five values and postAttachCommand is not one of them (rules.md, the waitFor rule); the bare model recommends postAttachCommand. A third grader checks the default, updateContentCommand."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

People on the team keep opening a terminal while the container is still setting itself up, and then things are half installed and they file bugs. I want the editor to hold off for as long as the config lets me, ideally until the very last of our hooks has finished. The repo is not checked out in this session; this is the whole .devcontainer/devcontainer.json:

```json
{
  "image": "mcr.microsoft.com/devcontainers/typescript-node:22",
  "remoteUser": "node",
  "onCreateCommand": "npm ci",
  "postCreateCommand": "npm run db:migrate",
  "postStartCommand": "docker compose up -d redis",
  "postAttachCommand": "npm run warm-cache"
}
```

What do I set `waitFor` to so the editor waits for the latest hook it can, and what is it waiting for today with no `waitFor` in the file?

End your reply with exactly these two lines, each filled in with a single lifecycle command name and nothing else:

SET: <name>
TODAY: <name>
