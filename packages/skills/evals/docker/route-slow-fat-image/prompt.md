---
name: route-slow-fat-image
description: "Routing: a slow, uncached, oversized image build is Dockerfile work and should load docker."
tags: [routing]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Every time I touch a single source file the image build reruns pip install from scratch and takes six minutes, and the result is 1.9 GB with gcc still in it. Fix the Dockerfile so rebuilds are quick and the image we ship is small.
