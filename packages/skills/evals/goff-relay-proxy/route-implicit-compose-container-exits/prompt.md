---
name: route-implicit-compose-container-exits
description: "Routing, implicit. A go-feature-flag container that exits when its flag source is down and answers without auth is a relay proxy config task (startWithRetrieverError, persistentFlagConfigurationFile, authorizedKeys); the prompt never says relay proxy, retriever or goff-proxy.yaml."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

one of the services in our docker compose stack uses the image gofeatureflag/go-feature-flag:latest. every time our gitlab is down for maintenance and that container gets restarted, it exits after a few seconds and every app behind it loses its flags. I'd like it to come back up with whatever flags it had last. while you're at it: it answers on 1031 to anyone on the VPN with no credentials at all, that needs closing too. what do I change?
