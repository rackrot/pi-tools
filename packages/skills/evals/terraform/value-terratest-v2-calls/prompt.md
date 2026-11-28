---
name: value-terratest-v2-calls
description: Value case. A new plan-only Terratest must use the v2 import path and the Context variants of the helpers (references/terratest.md); the bare model writes the removed v1 calls.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

we're adding a Go test for our s3 bucket terraform module. it's a brand new test directory with a fresh go.mod, so it will pull whatever Terratest release is current. the test should be plan only, no apply: run init and plan against ../examples/basic and assert the plan contains module.bucket.aws_s3_bucket.this. write the test file here in the chat.

end your reply with exactly these two lines, filled in:
IMPORT: <the Go import path of the Terratest terraform package the test imports>
CALL: <the name of the Terratest function the test calls to run init and plan>
