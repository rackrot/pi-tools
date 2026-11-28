---
name: value-content-trust-deadline
description: "Value: a host audit that finds DOCKER_CONTENT_TRUST=1 must say it is retired and give the Notary v1 shutdown date from the daemon-hardening reference."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

i'm auditing the Docker setup on our CI build host (Ubuntu 24.04, docker-ce, systemd). two things are in place today:

/etc/docker/daemon.json
```json
{
  "live-restore": true,
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" }
}
```

/etc/environment
```
DOCKER_CONTENT_TRUST=1
```

the build jobs pull their base images from Docker Hub. is the content trust line something i should keep relying on to make sure we only pull signed images? if it stops working at some point i need the date for the change ticket.

explain briefly, then end with exactly these two lines:

KEEP_DCT: <yes|no>
STOPS_WORKING: <YYYY-MM-DD, or "never">
