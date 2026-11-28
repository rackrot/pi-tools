---
name: route-harden-pasted-deployment
description: Positive trigger. A pasted Deployment that has to be tightened before it goes to a shared production cluster is manifest review and hardening; the skill and its description wording are not used.
tags: [routing]
runs: 3
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

this is what we run in staging today and it has to go to the shared prod cluster next week. the platform team says prod namespaces reject anything sloppy. fix it up so it survives there and tell me what you changed and why.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: invoice-renderer
spec:
  replicas: 1
  selector:
    matchLabels: { app: invoice-renderer }
  template:
    metadata:
      labels: { app: invoice-renderer }
    spec:
      containers:
        - name: invoice-renderer
          image: registry.internal/billing/invoice-renderer:latest
          ports:
            - containerPort: 8080
          env:
            - name: DB_PASSWORD
              value: "s3cr3t-staging"
          livenessProbe:
            httpGet: { path: /health/db, port: 8080 }
```
