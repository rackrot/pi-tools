---
name: value-ci-wait-and-test-port-defaults
description: "Value case. Two defaults from the references that Haiku does not reliably know: aspire wait gives up after 120 s (references/cli.md), and Aspire.Hosting.Testing randomizes proxied ports unless DcpPublisher:RandomizePorts=false is passed (references/testing.md). Bare Haiku answers 300 or 'unknown' for the first and sometimes 'none' for the second. Questions on aspire-output/ and deploy-vs-publish were dropped: Haiku answers them without the skill."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Two quick ones about CI for our Aspire 13 app (C# AppHost with a project resource `api`). There are no files to look at.

1. The pipeline calls `aspire wait api` with no `--timeout`. On a cold runner the image pulls take about three minutes. After how many seconds does the command give up by default?
2. Our `Aspire.Hosting.Testing` integration test expects the `api` endpoint on the port we set in the AppHost, but under the test the port is different on every run. Which `"Key=Value"` argument do I pass to `DistributedApplicationTestingBuilder.CreateAsync` so the ports stay as declared?

End your reply with exactly these two lines:

WAIT_DEFAULT_SECONDS: <number>
TEST_ARG: <Key=Value>
