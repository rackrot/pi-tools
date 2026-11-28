---
name: value-legacy-keys-and-env-overrides
description: "Value case. Migrating a 2023 goff-proxy.yaml: the current key names (server.port, swagger.enabled, authorizedKeys.evaluation), pollingInterval in milliseconds, and the env override naming rule (uppercase, underscore, array index) that the bare model replaces with guesses such as GITHUB_TOKEN."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I inherited this goff-proxy.yaml from 2023. The relay proxy is now on go-feature-flag v1.58 and I want the file on the current key names, with the two secrets taken out of the file and supplied as env vars on the container instead. We do not set envVariablePrefix.

```yaml
listen: 8080
enableSwagger: true
pollingInterval: 30        # we want it to poll every 30 seconds
apiKeys:
  - "ev-REDACTED"          # the key our apps use to evaluate flags
retriever:
  kind: github
  repositorySlug: acme/flags
  path: flags.goff.yaml
  token: "ghp_REDACTED"
```

Explain briefly, then end your reply with exactly these six lines, each value on the same line, nothing after them:

PORT_KEY: <full dotted config key that replaces `listen`>
SWAGGER_KEY: <full dotted config key that replaces `enableSwagger`>
EVAL_KEYS_KEY: <full dotted config key that replaces `apiKeys` for the apps' keys>
POLLING: <the number to write for pollingInterval>
TOKEN_ENV: <name of the env var the proxy reads for this retriever's token>
EVAL_KEYS_ENV: <name of the env var the proxy reads for the apps' keys>
