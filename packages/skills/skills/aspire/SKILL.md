---
name: aspire
description: 'Builds, runs, tests and deploys Aspire apps (formerly .NET Aspire): AppHost resource model, service defaults, integrations, the aspire CLI, Aspire.Hosting.Testing, aspire publish/deploy. Use for any *.AppHost, apphost.cs/apphost.ts or DistributedApplication.CreateBuilder code, AddProject/AddPostgres/AddRabbitMQ/WithReference/WaitFor wiring, startup order between resources, moving Docker Compose to Aspire, or a service that fails to start or connect under aspire run or F5. Read it before answering even when the workspace has no files: Aspire 13 APIs and CLI differ from what older versions did.'
---

# Aspire

For repos with an Aspire AppHost: a project on `Aspire.AppHost.Sdk`, a file-based `apphost.cs` (`#:sdk Aspire.AppHost.Sdk@...`), a TypeScript `apphost.ts`/`apphost.mts`, or an `aspire.config.json`.

Not for: hardening Dockerfiles or images (`docker`), hand-written Kubernetes manifests or Helm charts (`kubernetes`, `helm`), ASP.NET Core endpoint code inside a service (`aspnet-core`), EF Core data access (`ef-core`).

Aspire moves fast (13.x ships roughly monthly). Check the installed CLI with `aspire --version` and the AppHost SDK/package versions before relying on an API, and look up anything unfamiliar with `aspire docs search <terms>` / `aspire docs get <slug>` or Context7 (`/microsoft/aspire.dev`).

## Orient

1. Find the AppHost: `aspire.config.json` (its `appHost.path`), a csproj with `Sdk="Aspire.AppHost.Sdk/..."`, or `apphost.*`. Read it top to bottom; it is the system diagram.
2. Note the Aspire version (SDK attribute, `#:sdk`, `Aspire.Hosting.*` package versions, or `packages` in `aspire.config.json`). Keep every `Aspire.Hosting.*` package on the same version as the SDK.
3. Find the ServiceDefaults project and which services call `AddServiceDefaults()` / `MapDefaultEndpoints()`.
4. Run `aspire doctor` when the environment is in doubt (SDK, container runtime, dev certificates). The C# AppHost needs the .NET 10 SDK (services may target .NET 8+); a container runtime is Docker or Podman (`ASPIRE_CONTAINER_RUNTIME=podman`).

## Model rules

- **Name resources for their consumers.** The resource name becomes the connection string key (`ConnectionStrings__<name>`) and the service discovery name (`https+http://<name>`), so `AddDatabase("catalogdb")` in the AppHost must match `AddNpgsqlDbContext<CatalogDb>("catalogdb")` in the service.
- **`WithReference` wires; `WaitFor` orders.** `WithReference(x)` injects connection info and service discovery variables; it does not delay startup. Add `.WaitFor(x)` when the consumer can't start before `x` is healthy, `.WaitForCompletion(x)` for a one-shot job such as a migrator, `.WaitForStart(x)` when running is enough.
- **Health gates need health checks.** Integrations register their own. For your own HTTP resources add `.WithHttpHealthCheck("/health")` so `WaitFor` has something to wait on.
- **Hosting vs client packages.** The AppHost adds `Aspire.Hosting.<Tech>` (`aspire add <tech>`); each consuming .NET service adds the client integration (`Aspire.<Tech>...`, for example `Aspire.Npgsql.EntityFrameworkCore.PostgreSQL`) and calls its `builder.Add...` method with the same name. Community integrations are `CommunityToolkit.Aspire.Hosting.*`.
- **Secrets are parameters.** `builder.AddParameter("pg-password", secret: true)` and pass it in; never hard-code credentials. Locally, values come from configuration or `aspire secret set`; at deploy time they are prompted for or supplied by the environment.
- **Persistent local data:** `.WithDataVolume()` keeps data across runs; `.WithLifetime(ContainerLifetime.Persistent)` keeps the container itself running between AppHost restarts. Use both for dev databases you don't want reseeded.
- **Expose deliberately.** Endpoints are internal by default in deployment; add `.WithExternalHttpEndpoints()` only to resources users should reach.
- **Non-.NET services** read the injected environment directly: `ConnectionStrings__<name>`, `services__<name>__<endpoint>__0`, and (13.0+) `<NAME>_HTTP` / `<NAME>_HTTPS`. Tell them which port to bind with `WithHttpEndpoint(env: "PORT")`, and point their OpenTelemetry exporter at the injected `OTEL_EXPORTER_OTLP_ENDPOINT`.

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var pgPassword = builder.AddParameter("pg-password", secret: true);
var catalogDb = builder.AddPostgres("pg", password: pgPassword)
    .WithDataVolume()
    .AddDatabase("catalogdb");
var cache = builder.AddRedis("cache");

var api = builder.AddProject<Projects.Catalog_Api>("api")
    .WithReference(catalogDb).WaitFor(catalogDb)
    .WithReference(cache)
    .WithHttpHealthCheck("/health");

builder.AddViteApp("web", "../web")           // Aspire.Hosting.JavaScript
    .WithReference(api).WaitFor(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

More resource types (Python `AddUvicornApp`/`AddPythonApp`, `AddJavaScriptApp`/`AddNodeApp`, containers, executables), eventing and the TypeScript AppHost: [references/apphost.md](references/apphost.md).

## Run and inspect

For an agent, prefer the detached flow so the terminal isn't held by `aspire run`:

```bash
aspire start                      # build + start the AppHost in the background
aspire wait api --timeout 180     # block until healthy (defaults: status healthy, timeout 120 s)
aspire describe                   # resources, state, endpoints
aspire logs api --tail 200        # one resource's console logs
aspire otel traces                # traces from the terminal (preview)
aspire stop
```

`aspire run` is the interactive foreground equivalent (dashboard link, Ctrl+C to stop). Full command list and flags: [references/cli.md](references/cli.md).

When a resource fails: `aspire describe` for its state and exit code, `aspire logs <name>` for its output, then check the usual causes: a container runtime that isn't running, a name mismatch between AppHost and client integration, a missing `WaitFor`, a service listening on a hard-coded port instead of the injected one, or an untrusted dev certificate (`aspire certs trust`).

## Test

Integration tests start the real AppHost with `Aspire.Hosting.Testing`; bound every step with a timeout and wait for health before calling a service. By default the dashboard is off and proxied ports are randomized; pass `"DcpPublisher:RandomizePorts=false"` in the AppHost args to fix ports. Template and rules: [references/testing.md](references/testing.md). For a single service in isolation, use `WebApplicationFactory<T>` instead (see `aspnet-core` and `dotnet-testing`).

## Deploy

Add a compute environment to the AppHost (`AddDockerComposeEnvironment`, `AddKubernetesEnvironment`, `AddAzureContainerAppEnvironment`, ...), then `aspire publish` to write artifacts or `aspire deploy` to apply them. Targets, packages and the flow: [references/deployment.md](references/deployment.md). Ask before running `aspire deploy` or `aspire destroy` against a real environment.

## Gotchas

- `MapDefaultEndpoints()` maps `/health` and `/alive` only in Development by design; don't expose them unconditionally in production without reading the security note in the template. Outside Development, map a health endpoint deliberately (for example an internal-only `/health`) or the `WithHttpHealthCheck("/health")` target and the generated probes will 404.
- `aspire new`/`aspire init` and `aspire agent init` can write agent skill files (`.claude/skills/...`) and MCP config into the repo; don't run `aspire agent init` unless the user asks.
- Installing the CLI: prefer a package manager (`dotnet tool install -g Aspire.Cli`, `brew install --cask microsoft/aspire/aspire`, `winget install Microsoft.Aspire`, `npm install -g @microsoft/aspire-cli`). If using the install script, download it, read it, then run it rather than piping `curl` into `bash`.
- `AddPythonApp` and some other hosting APIs are marked experimental (ASPIREHOSTINGPYTHON001-style diagnostics); suppress the diagnostic deliberately, not project-wide.
- The `Projects.*` type for `AddProject<T>` is generated from `ProjectReference`s in the AppHost csproj; file-based AppHosts use `AddProject("name", "../Api/Api.csproj")` instead.
