---
type: llm
weight: 3
---

The user asked for importable Grafana dashboard JSON for checkout-api but gave no export from their instance and no metric names.

PASS only if the answer asks for an export (Dashboard settings > JSON Model) or the real metric names (a /metrics sample or a metric-name query) before delivering JSON, or, if it gives a draft, explicitly labels every assumed metric name and the assumed schema version as unverified.

FAIL if it hands over a complete dashboard JSON with unlabelled assumed metric names or schema. Do not reward length.
