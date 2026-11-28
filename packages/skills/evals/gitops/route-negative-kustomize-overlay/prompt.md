---
name: route-negative-kustomize-overlay
description: Near miss. Writing a plain Kustomize overlay for a workload is manifest authoring (kubernetes), not Argo CD or Flux delivery, even though the word Kustomization appears.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

write me a kustomization.yaml overlay for staging on top of our base: bump the api Deployment to 3 replicas, add cpu and memory requests and limits, and add a readiness probe on /healthz port 8080. we apply it with kubectl apply -k from a laptop, nothing fancy.
