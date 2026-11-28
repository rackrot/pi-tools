---
name: golang-performance
description: "Measures and fixes Go performance: benchmarks compared with benchstat, pprof profiles and execution traces, escape analysis, GC, GOMEMLIMIT and GOMAXPROCS in containers, CI benchmark regression checks. Use when Go code is slow, allocates or uses too much memory, or a Go service is OOM-killed or CPU-throttled in a container; when writing or comparing benchmarks, reading a profile, or judging whether a claimed speedup (such as a PR quoting go test -bench numbers) is real. Not for adding production metrics, dashboards or alerts (observability-instrumentation)."
---

# Go performance

Not for cobra/viper CLI structure (`golang-cli`), production metrics and dashboards (`observability-instrumentation`), or writing the CI workflow file itself (`forgejo-actions` on Forgejo).

Measure first, change one thing, measure again with the same method. A speedup counts only when a like-for-like comparison shows it. Check Go and tool versions with `go version`, and compare benchmarks only on the same toolchain, since a new Go release changes allocator and compiler behavior independent of your code.

## Workflow

1. **Pick the metric and the workload.** Name one target (latency, throughput, bytes allocated, RSS, CPU) and a representative input. Without both, results can't be compared.
2. **Rule out outside time.** If the profile shows low CPU but high latency, the bottleneck may be a database, an upstream call, or lock waits, so reducing allocations won't help. A goroutine profile full of `net.(*conn).Read` or `database/sql` stacks, or a wall-clock profiler such as `fgprof`, confirms it. See [references/pprof.md](references/pprof.md).
3. **Record a baseline.** Write a benchmark and pick `-count` by goal: 6 for a quick local look (the fewest samples benchstat gives a 95% interval for), 10 for a pre-merge comparison, 20 or more for a change under 5% or a noisy runner. Read [references/benchstat.md](references/benchstat.md) for the commands, pre-compiled interleaved runs, and how to read the output.
4. **Locate the cost.** Profile the benchmark (`-cpuprofile`, `-memprofile`), then read it with `go tool pprof`. Pick the tool from the table below.
5. **Change one factor.** Apply one fix from the table, with a comment saying why it is faster when the code looks odd.
6. **Remeasure and decide.** Run the same command on the same machine, compare with `benchstat`, and keep the change only if the difference is significant and the code stays readable. Put the benchstat output in the commit body.

## Bottleneck to fix

| Signal | Likely cause | Go to |
| --- | --- | --- |
| `alloc_objects` high, `runtime.mallocgc` or `scanobject` near the top of the CPU profile | Allocation churn | [references/patterns.md](references/patterns.md), then confirm with [references/compiler-analysis.md](references/compiler-analysis.md) |
| One function dominates flat CPU | Hot loop, algorithm, or reflection | [references/patterns.md](references/patterns.md) |
| GC share high, or the container is OOM-killed | GC pacing or memory limit | [references/runtime-tuning.md](references/runtime-tuning.md) |
| Low CPU, high latency, goroutines blocked | I/O wait, contention, scheduling | Trace and block/mutex profiles in [references/pprof.md](references/pprof.md) |
| Same work done repeatedly | Missing cache or hoisting | [references/patterns.md](references/patterns.md) |
| Benchmark passes locally, regresses in production | Different input, GC, or CPU limit | Profile production with `net/http/pprof`, then [references/runtime-tuning.md](references/runtime-tuning.md) |

## Common mistakes

- Optimizing before profiling. Intuition about the hot spot is often wrong, and an unmeasured change adds code for nothing.
- Treating one benchmark run, or a result marked `~`, as evidence. benchstat needs several runs to say anything.
- Rerunning until a result turns significant. That selection bias produces false wins, so raise `-count` once and accept the answer.
- Comparing runs from different machines, power states, or Go versions.
- Reaching for `unsafe`, `sync.Pool`, or manual pooling without a profile that shows the allocation matters. Each trades safety or clarity for speed.
- Benchmarking a toy input. Allocation and cache behavior change with size, so use sub-benchmarks over realistic sizes.

## CI regression checks

Compare base and head in the same job on the same runner, with `-count` of 10 or more and `benchstat`, and set the threshold well above shared-runner noise. Read [references/ci-regression.md](references/ci-regression.md) when adding or tuning such a check. Follow the repo's action-pinning convention when you write the workflow.
