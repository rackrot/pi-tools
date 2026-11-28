---
name: value-sbom-attest-commands-invoked
description: Value case. The prompt types the slash command. Four release commands from references/sbom.md; the rule under test is that the Cosign attestation is made against the image digest, not the tag the user wrote (weight 3). The bare model attests ghcr.io/acme/api:2.3.0. The spdxjson predicate type and the pinned identity plus issuer on verify are checked at weight 1; Haiku gets those right unaided, as it does the Syft and Grype commands, which are not graded.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

/skill:security-scan no scan today, and you have no shell here. Our release workflow (`.github/workflows/release.yml` on `main` in `acme/api`) pushes `ghcr.io/acme/api:2.3.0` and a customer now wants an SBOM with it, in SPDX JSON. I need four commands to paste into the workflow and the customer docs, nothing installed or run by you:

1. write the SPDX JSON SBOM of the pushed image to `sbom.spdx.json`
2. fail the job when that SBOM has a vulnerability of high severity or worse, counting only vulnerabilities that already have a fix
3. attach the SBOM to the image as a signed attestation, keyless
4. what the customer runs to verify that attestation

end your reply with one fenced code block that holds exactly these four commands, in this order, and nothing after it.
