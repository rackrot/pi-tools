---
name: route-negative-dockerfile-nonroot
description: Near miss. Rewriting a Dockerfile so the image runs as a numeric non-root user belongs to docker, even though the reason given is that the cluster refuses the pod.
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the cluster refuses to start our image because it runs as root. I don't want to touch the yaml, the image is what's wrong. rewrite this Dockerfile so it's multi-stage and the final image runs as a numeric non-root user:

```dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 8080
CMD ["node", "dist/server.js"]
```
