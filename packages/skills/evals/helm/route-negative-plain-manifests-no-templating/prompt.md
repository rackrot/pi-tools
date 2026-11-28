---
name: route-negative-plain-manifests-no-templating
description: Near miss. Plain manifests with per-environment Kustomize overlays belong to kubernetes; Helm is mentioned only as the option the user has already rejected.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we looked at helm for this and decided against it, too much templating for one small service. just write me plain manifests for the `notifier` worker (Deployment, Service on 8080, a ServiceAccount) with sane probes, resource requests and a locked-down securityContext, plus kustomize overlays for staging and prod that only change the replica count and the image tag. we apply with kubectl apply -k.
