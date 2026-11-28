---
name: value-restart-vs-hot-reload
description: "Value case. Only authorizedKeys hot-reloads in default mode (every other goff-proxy.yaml edit needs a restart), and the configmap retriever works only inside the cluster. The bare model answers RESTART for the key change and sometimes WORKS for the out-of-cluster configmap."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We run the go-feature-flag relay proxy (v1.58) as 4 replicas behind a Kubernetes Service. All pods mount the same goff-proxy.yaml from a ConfigMap, we do not use flagSets, and flags come from a `kind: configmap` retriever. I'm planning tonight's change window and need three answers:

- A: we add a second key to `authorizedKeys.evaluation` in goff-proxy.yaml. Do the running pods pick that up by themselves once the mounted file changes, or does it only take effect after a rolling restart?
- B: same question for adding a second retriever (an s3 bucket) under `retrievers`.
- C: we also want a fifth instance on a VM outside the cluster, with a kubeconfig on the VM and the same `kind: configmap` retriever. Will that instance be able to load the flags?

Explain briefly, then end your reply with exactly these three lines, nothing after them:

A: RELOAD or RESTART
B: RELOAD or RESTART
C: WORKS or FAILS
