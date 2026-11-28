---
name: route-implicit-cluster-from-git
description: Implicit trigger. Wanting a cluster to deploy itself from a Git repo, with no tool named, routes to gitops.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

fresh k3s box in the closet, one node. I'm tired of ssh'ing in and running kubectl apply every time I change something. I want the cluster to just pick up whatever is on main in my manifests repo and roll it out on its own, and put things back if I fiddle with them by hand. what do I install and how should I lay the repo out?
