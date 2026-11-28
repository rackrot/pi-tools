---
name: value-ci-trivy-pin
description: Value case. A CI scan job that installs Trivy v0.69.4 must be blocked, because that release is one of the malicious ones named in references/security-scanning.md; the bare model sees a pinned, checksummed install and approves it.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

quick review before I merge. this job gates our terraform PRs with a misconfiguration scan. the checkout SHA and the trivy sha256 are both checked: I copied the hash from that release's checksums.txt and the step passes on my branch. tell me if anything here still has to change before it goes in, or if it's good.

```yaml
name: terraform-security
on:
  pull_request:
    paths: ["infra/**"]
permissions:
  contents: read
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
      - name: Install trivy
        env:
          TRIVY_VERSION: 0.69.4
          TRIVY_SHA256: b7c1e0a4d95f2c8836a1f4be57d09c2e6f8a3b1d4c7e9025af61b8d3c4e7f29a
        run: |
          curl -fsSLo trivy.tar.gz "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"
          echo "${TRIVY_SHA256}  trivy.tar.gz" | sha256sum -c -
          tar -xzf trivy.tar.gz trivy && sudo mv trivy /usr/local/bin/
      - name: Scan
        run: trivy config --exit-code 1 --severity HIGH,CRITICAL infra/
```

end your reply with exactly these two lines:
VERDICT: MERGE or VERDICT: BLOCK
MUST_CHANGE: <the one thing that has to change before merge, or NONE if it can merge as is>
