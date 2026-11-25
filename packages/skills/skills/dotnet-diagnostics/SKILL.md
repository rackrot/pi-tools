---
name: dotnet-diagnostics
description: "Collects runtime evidence from running or crashed .NET processes (dotnet-counters, dotnet-trace, dotnet-dump, dotnet-monitor, PerfView, perfcollect, container and Kubernetes dumps, mobile crash symbolication) and sets the measurement rules for performance work: BenchmarkDotNet, hot-path gate, SIMD. Use for high CPU, memory growth, hangs, crashes in production, capturing a dump, slow C# code, or writing and comparing benchmarks."
---

# .NET diagnostics

Not for general diagnosis method (`problem-solving`), metrics, dashboards and alerting (`observability-instrumentation`), C# fixes once the cause is known (`csharp`), build failures and slow builds (`msbuild`), EF Core query tuning (`ef-core`), or cluster and image changes beyond diagnostics (`kubernetes`, `docker`).

This skill picks the right collection tool for the environment, gives exact commands, and hands the artifact to the right analysis tool. Collect first, then reason from what the trace, dump or counters show. For code that is merely slow, it also holds the rule that nothing is optimised without a measurement, and the BenchmarkDotNet rules (see Performance work).

## Rules that hold on every run

- **Ask before you touch production.** Get the user's explicit go-ahead before any step that changes a live system: attaching a tracer or dumper to a running process (a full dump pauses the process and can push a memory-limited container into an OOM kill), setting `DOTNET_DbgEnableMiniDump` or other env vars on a deployment (that restarts pods), installing tools into a running container, adding capabilities or privileged sidecars, `kubectl debug`, editing `core_pattern` or the Windows WER registry. Show the command and what it changes, then wait.
- **Download, inspect, then run.** Never pipe `curl` or `wget` into a shell. Save the file, check it (`file` shows an ELF or PE executable, not an HTML error page; read a script such as `perfcollect` before running it as root), then `chmod +x` and run it.
- **Verify the PID** before any `-p <PID>` command (`dotnet-trace ps`, `dotnet-dump ps`, `ps` in the container), even when the app is expected to be PID 1.
- **Run as the target's user or root**, and on Linux share its `TMPDIR`; otherwise the dotnet-* tools time out connecting to the diagnostic port.
- **Turn temporary settings back off.** Remind the user to remove crash-dump env vars, privileged sidecars and debug capabilities once the artifact is collected.
- In the workload context (you can run commands where the app runs), run the collection yourself after the go-ahead; otherwise give the user the commands to run.

## Workflow

1. **Establish the environment.** Find out, from the repo (Dockerfile base image, TFM, k8s manifests) or by asking the user:
   - Symptom: high CPU, memory growth, slow requests, hang, excessive GC, crash, HTTP 5xx or timeouts to downstream services, assembly load failure.
   - Runtime: .NET Framework or modern .NET, and the version (10+ unlocks `dotnet-trace collect-linux`); CoreCLR or NativeAOT.
   - OS, and whether it runs on a host, in a container, or in Kubernetes.
   - Admin or root access, and console access to the container.
   - Whether the issue reproduces quickly or takes hours.
2. **Triage with counters** when the symptom is vague: `dotnet-counters monitor -p <PID> --counters System.Runtime` shows CPU, GC heap, allocation rate, thread pool queue length and lock contention in one view. Read [references/dotnet-counters.md](references/dotnet-counters.md) for install and counter names.
3. **Pick the tool** from the matrix below, then read its reference.
4. **Pick the recipe for the symptom** (providers, profiles, one dump or two) from [references/symptoms.md](references/symptoms.md).
5. **Collect**, copy the artifact off the target, and write down the handoff details: runtime version, OS and kernel, image tag or build SHA, PID and process name, UTC start and end times, exact command, artifact path.
6. **Point to the analysis tool** (table at the end). Collection is this skill's job; open the artifact and analyze it only when the user asks.

## Tool choice

| Environment | Preferred | Fallback | Reference |
| --- | --- | --- | --- |
| Windows, modern .NET, admin | PerfView | `dotnet-trace` without admin | [references/perfview.md](references/perfview.md) |
| Windows, .NET Framework | PerfView (needs admin) | Without admin: dumps only (`procdump -ma`, Task Manager); no trace option exists | [references/perfview.md](references/perfview.md) |
| Windows containers | PerfView on the host with `/EnableEventsInContainers` | `dotnet-trace` inside the image | [references/perfview.md](references/perfview.md) |
| Linux, .NET 10+, root, kernel 6.4+ | `dotnet-trace collect-linux` (native and kernel stacks) | `dotnet-trace collect` | [references/dotnet-trace.md](references/dotnet-trace.md) |
| Linux, before .NET 10 | `dotnet-trace collect` | `perfcollect` (root) when native stacks are needed | [references/dotnet-trace.md](references/dotnet-trace.md), [references/perfcollect.md](references/perfcollect.md) |
| Container or k8s, console access | `dotnet-trace` / `dotnet-dump` inside the container | `perfcollect` in a privileged sidecar | [references/dotnet-trace.md](references/dotnet-trace.md) |
| Container or k8s, no console | `dotnet-monitor` sidecar | | [references/dotnet-monitor.md](references/dotnet-monitor.md) |

Trade-offs to state when recommending: PerfView gives the richest data but needs admin and Windows; `dotnet-trace collect` is cross-platform and needs no admin but shows managed frames only; `perfcollect` and `collect-linux` add native stacks but need root; `dotnet-monitor` needs no tools in the app image but needs a sidecar and auth setup.

## Dumps

Dumps answer "what is on the heap" (leaks, two dumps diffed) and "what is each thread waiting on" (deadlocks). They do not show GC behavior or where CPU time goes; take a trace for those.

1. Detect the runtime. On Linux: `strings "$(readlink /proc/<pid>/exe)" | grep -q CorExeMain && echo CoreCLR || echo "NativeAOT or native"`. A process that loads `clr.dll` on Windows is .NET Framework: use `procdump -ma <pid>` or Task Manager's "Create memory dump file".
2. Read the reference:
   - CoreCLR, any platform (automatic crash dumps via `DOTNET_DbgEnableMiniDump`, on-demand `dotnet-dump collect`): [references/dumps.md](references/dumps.md)
   - NativeAOT (OS core dumps, `createdump`, `gcore`, `lldb`, WER): [references/dumps-nativeaot.md](references/dumps-nativeaot.md)
   - Docker or Kubernetes (`SYS_PTRACE`, volumes, pod specs), read with one of the above: [references/dumps-containers.md](references/dumps-containers.md)
3. Before enabling collection, confirm the output directory exists and is writable by the app's user; the runtime does not create it. After collection, report the dump path and its size.

## Mobile crashes

An Android tombstone or an Apple `.ips` crash log with frames in `libcoreclr`, `libmonosgen-2.0` or `libSystem.*`: symbolicate the .NET runtime frames with symbols from the Microsoft symbol server, following [references/mobile-symbolication.md](references/mobile-symbolication.md). Pure Java, Kotlin, Swift or Objective-C crashes are out of scope.

## Performance work

Measure first, change one thing, measure again the same way. A speedup counts only when a like-for-like BenchmarkDotNet comparison or a before/after profile shows it. Check the TFM and SDK (`dotnet --version`, `<TargetFramework>`) before suggesting an API: many fixes need .NET 7, 8 or 9.

**Gate: is this a hot path?** Before rewriting code for speed, establish one of:

- a profile or trace that names the method (the tools above, or BenchmarkDotNet's `EventPipeProfiler`),
- a benchmark that reproduces the slowness,
- the user naming the code as performance-critical (request path, tight loop, parser, serializer).

Without any of these, say the change matters only if profiling shows the code is hot; never trade readability for a micro-optimization in code that runs rarely, and report only critical findings (deadlock, crash, unbounded regex, a regression over 10x). If the profile shows low CPU but high latency, the time is outside the code (database, network, locks, thread-pool starvation): collect counters and a trace with the workflow above instead of tuning allocations.

**Benchmarks.** Read [references/benchmarkdotnet.md](references/benchmarkdotnet.md) before writing or running one, and [references/benchmarkdotnet-config.md](references/benchmarkdotnet-config.md) for diagnosers, exporters, job presets or unstable results. Core rules:

- Name the comparison first (two approaches, runtimes, package versions, before/after, runtime settings, input sizes) and mark a baseline (`[Benchmark(Baseline = true)]` or a job's `.AsBaseline()`) so the table shows `Ratio`.
- `dotnet add package BenchmarkDotNet` without a version (or the repo's CPM file). Build in Release.
- Pass `--filter` every time (`BenchmarkSwitcher` otherwise waits for interactive input) and check the entry point forwards `args`.
- Run `--job Dry` first, iterate with `--job Short`, report with the default job. Redirect output to a file and read `*-report-github.md`.
- Return results, read inputs from fields or `[Params]`, set up in `[GlobalSetup]`, no manual loops, materialize LINQ. Add `[MemoryDiagnoser]`.
- Estimate case count before running: methods x parameter values x jobs, about 20 s each with the default job.
- Compare only numbers from the same machine, Release build and, where possible, the same run. Take one run with wider iteration counts and accept the answer; do not rerun until it looks good.

Vectorizing a loop (`TensorPrimitives`, `Vector128<T>`): [references/simd.md](references/simd.md).

## Analysis tools

| Artifact | Open with |
| --- | --- |
| `.nettrace` | PerfView or Visual Studio on Windows; `dotnet-trace convert --format Speedscope` for speedscope.app; `dotnet-trace report <file> topN` for a quick text summary |
| `.etl` / `.etl.zip` | PerfView |
| `*.trace.zip` from perfcollect | PerfView on Windows, or `./perfcollect view` on Linux |
| CoreCLR dump | `dotnet-dump analyze` (SOS: `clrstack -all`, `dumpheap -stat`, `gcroot`, `syncblk`), WinDbg or `lldb` with SOS; diff two heap dumps in PerfView |
| NativeAOT core | `lldb` or `gdb` with the app's own debug symbols |
| `.crashreport.json` | Read it; it lists threads and frames at the crash |

## Gotchas

- Specifying `--providers` on `dotnet-trace collect` drops the default profiles; add `--profile dotnet-common,dotnet-sampled-thread-time` back when you still want the thread-time samples.
- `--duration` takes `dd:hh:mm:ss` (`00:00:00:30` is 30 seconds).
- `collect-linux` is a preview verb with a newer `.nettrace` format; open its output in a current PerfView, as `convert` and `report` may not read it yet.
- With PerfView triggers, stop on the symptom, never on recovery: the circular buffer overwrites the interesting window otherwise.
- A full or heap dump pages in the process's memory; in a container near its memory limit, raise the limit first or expect an OOM kill.
- `DOTNET_DiagnosticPorts` suspends app startup until a tool connects, unless the value ends in `,nosuspend`.
- Debug builds and attached debuggers disable JIT optimizations; BenchmarkDotNet refuses to run non-optimized assemblies unless forced.
- Tiered compilation and Dynamic PGO change code during warmup, so a hand-timed `Stopwatch` loop over a few iterations measures tier-0 code.
- `DOTNET_` environment variables such as `DOTNET_TieredPGO=0` or `DOTNET_EnableAVX2=0` don't affect code precompiled with ReadyToRun or Native AOT.
- Short-lived processes that fail at startup (assembly load errors) exit before you can attach; launch them under the tool instead: `dotnet-trace collect --clrevents assemblyloader -- ./myapp`.
