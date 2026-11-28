---
name: promql
description: Writes, fixes and explains PromQL queries and edits Prometheus and Alertmanager config, for any Prometheus-compatible backend (Prometheus, Thanos, Mimir, VictoriaMetrics). Use for every PromQL question, even a single query (rates, error ratios, histogram quantiles on classic or native histograms, holes or gaps in a graph) and for scrape configs, recording and alerting rules, Alertmanager routes and receivers, and promtool rule tests. Read it before answering from memory; it holds easy-to-miss rules on histogram types, rule naming and keeping credentials out of config. Not for adding metrics to application code (observability-instrumentation) or Grafana dashboards (grafana-dashboards).
---

# PromQL and Prometheus

Two jobs share this skill. Query work reads metrics to answer a question. Config work changes what Prometheus scrapes, records, and alerts on. Checked against the Prometheus docs (querying functions, recording and alerting rules, unit testing, Alertmanager configuration).

Not for application instrumentation or SLO design (the `observability-instrumentation` skill) or Grafana dashboards (`grafana-dashboards`).

## Credentials

A credential must never pass through the prompt, a command line, or a file you write. Command arguments land in shell history and process listings.

- Read the token or password from a file the user created (`chmod 600`), or from an environment variable that holds that path or is read by the tool itself (for example `PROMQL_AUTH_CREDENTIALS`). Reference it by name or path; never expand a token into a command argument such as `curl -H "Authorization: Bearer $TOKEN"`; use `curl -H @file` (see `references/access.md`).
- If a query fails with 401 or 403, or no host is configured, tell the user what to set and wait. Do not create or edit their credential file.
- Ask for the base URL only. Treat a URL with embedded `user:pass@` as a secret.

See `references/access.md` for the HTTP API and the optional `promql` CLI.

## Query rules

1. Apply `rate()` or `increase()` to counters. A raw counter only climbs, so its absolute value says nothing.
2. Filter in the innermost selector (`rate(http_requests_total{job="api"}[5m])`). Selectors are evaluated first, so late filtering scans every series.
3. Check the histogram type first: `/api/v1/metadata?metric=<name>` says histogram, and a `_bucket` series means classic; a histogram with only the bare name is native (needs `scrape_native_histograms: true`, stable from Prometheus 3.8). A bare name with type gauge or summary is neither. For a classic histogram keep `le` in the grouping: `histogram_quantile(0.99, sum by (le, route) (rate(x_bucket[5m])))`; without `le` the result is wrong or NaN. A native histogram has no `le`: `histogram_quantile(0.99, sum by (route) (rate(x[5m])))`, and `histogram_fraction` gives the share under a bound.
4. Isolate one instance before aggregating when debugging. An average across replicas hides the one overloaded pod.
5. Aggregate in PromQL (`sum by`, `topk`), never by pulling raw series into a script.
6. Size the range window to at least a few scrape intervals. Use `rate()` for alerts and graphs; `irate()` only for fast-moving dashboards.
7. Sum numerators and denominators separately, then divide. Averaging ratios is wrong.

## Query cost

- Count series first on an unfamiliar metric: `count(metric_name)`. Add label filters if it is large.
- Confirm the time window with the user before a range query, and prefer several short ranges over one long one.
- A query that takes over about 15 seconds is too broad. Narrow the matchers, the range, or add an aggregation, then keep that scope for the session.
- Prefer small outputs (a graph, `topk`, a narrow window) over thousands of raw rows.
- When a metric shows gaps, run `up{job="...", instance="..."}` before blaming the application. A `0` means the scrape failed.

## Investigation workflows

Pick the method from the question, then read `references/investigations.md` for the queries.

- Service slow or failing: RED (rate, errors, duration).
- Host or resource slow: USE (utilization, saturation, errors).
- Missing data: check `up`, then scrape config.

## Config work

Read `references/server-config.md` before writing or editing any scrape config, recording or alerting rule, promtool test, or Alertmanager route or receiver, including when you are writing the block from scratch. In short: aggregate rules with `without (...)`, name recording rules `level:metric:operations`, and put secrets in `*_file` fields. Validate every change with `promtool check config` or `promtool check rules` and test alert logic with `promtool test rules` before reporting done.

## References

- `references/access.md`. Read when running queries against a live server or setting up credentials.
- `references/investigations.md`. Read when diagnosing latency, errors, saturation, or data gaps.
- `references/server-config.md`. Read when editing scrape configs, recording or alerting rules, or Alertmanager.
