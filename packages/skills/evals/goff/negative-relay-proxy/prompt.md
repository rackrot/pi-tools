---
name: negative-relay-proxy
description: Hard negative. Configuring and deploying the GO Feature Flag relay proxy belongs to goff-relay-proxy, not goff.
tags: [routing]
max_turns: 5
model: claude-sonnet-5-5
allowed_tools: [Read, Glob, Grep, Skill]
---

our go-feature-flag relay proxy pod in k8s crashloops on startup since we switched its flags to a github retriever, and when it did run, anyone inside the cluster could call it without a key. fix the goff-proxy.yaml and give me the helm install command, please
