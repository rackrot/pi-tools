---
name: value-dashboards-as-code-review
description: "Value case. Three items of a dashboards-into-git PR judged against the provisioning rules: folder combined with foldersFromFilesStructure, a V2 dashboard kept in the Kubernetes resource format, and a Terraform folder uid as the control."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm reviewing a PR that moves our Grafana dashboards into git. Grafana is on 12.3. I can't share the diff, so here is what it does. for each item below tell me whether it is fine as written or has to change before merge.

- R1: the dashboard file provider config sets `folder: Services` and, under `options`, `foldersFromFilesStructure: true`, so that the subdirectories of the repo show up as folders.
- R2: one board uses the new tabs layout. Its file in the provisioned directory is not the plain dashboard JSON like the others: the top level is `apiVersion: dashboard.grafana.app/v2beta1`, `kind: Dashboard`, `metadata.name` holding the uid, and the dashboard itself under `spec`.
- R3: two boards that are not in the provisioned directory (the shared platform ones) are managed by Terraform instead, with a `grafana_dashboard` resource where `folder = grafana_folder.services.uid`.

end your reply with exactly one line per item in the form `R1: OK` or `R1: CHANGE`, R1 to R3 in order.
