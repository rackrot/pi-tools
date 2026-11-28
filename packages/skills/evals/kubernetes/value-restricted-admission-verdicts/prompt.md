---
name: value-restricted-admission-verdicts
description: Value case. Pod specs judged against the restricted Pod Security level on a 1.37 cluster, including the 1.34 host-in-probe and lifecycle-hook control, the sysctls added to the safe set in 1.37, a pinned enforce-version that keeps an older release's rules, and the fact that readOnlyRootFilesystem is not a restricted control; the bare model does not know the 1.34 and 1.37 changes.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

cluster is Kubernetes v1.37. two namespaces:

- `apps` has `pod-security.kubernetes.io/enforce: restricted` and `pod-security.kubernetes.io/enforce-version: latest`
- `legacy` has `pod-security.kubernetes.io/enforce: restricted` and `pod-security.kubernetes.io/enforce-version: v1.33`

every pod below has one container and sets, at pod level, `runAsNonRoot: true`, `runAsUser: 10001` and `seccompProfile.type: RuntimeDefault`, and on the container `allowPrivilegeEscalation: false` and `capabilities.drop: [ALL]`. anything I don't mention is unset. each item is the only difference from that. tell me for each one whether Pod Security Admission lets the pod be created.

- P1: namespace `apps`. the container sets `readOnlyRootFilesystem: false`.
- P2: namespace `apps`. the pod-level `seccompProfile` is removed, so no seccomp profile is set anywhere.
- P3: namespace `apps`. the container has `readinessProbe.httpGet: { host: 127.0.0.1, path: /ready, port: 8080 }`.
- P4: namespace `legacy`. same pod as P3.
- P5: namespace `apps`. the pod sets `securityContext.sysctls: [{ name: net.ipv4.tcp_notsent_lowat, value: "16384" }]`.
- P6: namespace `legacy`. same pod as P5.
- P7: namespace `apps`. the container has `lifecycle.preStop.httpGet: { host: 10.0.0.12, path: /drain, port: 8080 }`.

end your reply with exactly one line per pod in the form `P1: ADMIT` or `P1: REJECT`, P1 to P7 in order.
