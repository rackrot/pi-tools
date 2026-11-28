---
name: grafana-dashboards
description: "Designs, reviews and trims Grafana dashboards (boards) so they answer on-call questions, and keeps them in git. Use for any Grafana dashboard question, even when the workspace holds no dashboard files: too many panels, what goes at the top, RED or USE panels, dashboards lost after a rebuild, 'datasource not found' after an import, dashboard JSON and datasource UIDs, file provisioning, Terraform or the Foundation SDK. Not for writing the PromQL inside a panel (promql)."
---

# Grafana dashboards

A dashboard is for answering questions during operation, not for showing every metric. Checked against Grafana's dashboard best practices, JSON model, provisioning, and Observability as Code docs.

Not for PromQL authoring (the `promql` skill), metric instrumentation or SLO design (`observability-instrumentation`), or charts inside an application.

## Workflow

1. Write the operator questions first: Is it healthy? Where is the bottleneck? What changed? What should someone do? Ask the user for the audience and the failure they fear.
2. Choose the method. Use RED (rate, errors, duration) for services and USE (utilization, saturation, errors) for resources. Grafana recommends alerting on RED symptoms.
3. Inspect an existing dashboard and the data source first: metric names, labels, variable conventions, and the current JSON schema. Do not invent metrics. Query the backend (the `promql` skill, if installed) to confirm each one exists. If you have neither an export from the target instance nor the real metric names, stop and ask for them (Dashboard settings > JSON Model, and a /metrics sample or a metric-name query). Do not hand over JSON built from assumed metric names or a remembered schema. If the user still wants a draft, label every assumed metric name and the assumed schema version as unverified.
4. Build the smallest board that answers the questions, top to bottom: overview (health, big numbers), performance (latency and traffic trends), resources (saturation), then service-specific detail.
5. Cut every panel that no question needs. A panel earns its place by changing what someone does.
6. Save the dashboard as code and review the diff (`references/provisioning.md`).

## Panel sets

| Target | Panels |
| --- | --- |
| HTTP service (RED) | request rate, error ratio, p50/p95/p99 latency, saturation (in-flight, queue) |
| Resource (USE) | utilization, saturation (queue, load), errors |
| Queue or Kafka | broker or consumer count, lag, messages in and out, under-replicated partitions |
| Database | connections vs limit, query latency, replication lag, cache hit ratio, disk |

## Quality checklist

- [ ] Every panel has a title, unit, and a description or link when the meaning is not obvious.
- [ ] Thresholds and colors mean something (they match an SLO or alert, not decoration).
- [ ] Variables for the common filters (environment, service, instance), with sane defaults.
- [ ] Default time range and refresh suit the use; no 5-second refresh on a heavy query.
- [ ] Datasources are referenced by `uid`, not by name.
- [ ] Panels use current types (`timeseries`, `stat`, `gauge`, `table`, `heatmap`, `bargauge`). Grafana migrates the legacy Graph panel to time series automatically, so do not generate `graph`.
- [ ] Alerts live in Grafana Alerting or Prometheus rules, not on panels. Dashboard-attached legacy alerts are gone.
- [ ] No vanity panels; sections are grouped and ordered by the questions.

## Dashboard JSON

Grafana has three JSON schema models: the Classic model (the default before v12.2), the V1 resource that wraps the Classic model in a Kubernetes-style `spec` (the default API format from v12.2 to v13.0), and the V2 resource, the current schema, with newer layouts and conditional rendering. Export Classic when the target runs v12.4 or older. Do not write dashboard JSON from memory (see Workflow step 3). Export one from the target instance (Dashboard settings, JSON Model) or from the Foundation SDK, and edit that, so the schema matches the running version. Use `$datasource` or `{"type": "prometheus", "uid": "<datasource-uid>"}` for data sources.

## References

- `references/provisioning.md`. Read when committing dashboards, wiring file provisioning, or using Terraform or the Foundation SDK.
