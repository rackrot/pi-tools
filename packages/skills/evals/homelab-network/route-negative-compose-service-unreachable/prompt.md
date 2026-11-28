---
name: route-negative-compose-service-unreachable
description: "Near miss: two Compose services on different user-defined networks that cannot reach each other is container networking (docker skill), even though it runs on a home server."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

on my home server I split my compose stack into two files. the api container now logs `getaddrinfo ENOTFOUND postgres` on startup. api is on a network called `frontend`, postgres is on `backend`, both declared in their own compose file with the default driver. it worked when everything was in one file. what's wrong and how do I fix it?
