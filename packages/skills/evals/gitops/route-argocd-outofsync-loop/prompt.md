---
name: route-argocd-outofsync-loop
description: Trigger. An Argo CD app that flips back to OutOfSync after every sync routes to gitops (sync and drift debugging).
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our payments app in Argo CD goes green after a sync and about a minute later it's OutOfSync again, every time. the diff only ever shows spec.replicas on the Deployment. auto-sync with self heal is on. what is going on and what's the right fix?
