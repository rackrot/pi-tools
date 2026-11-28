---
name: value-go-provider-v1-option-renames
description: Value case. Upgrading the Go OpenFeature provider for GOFF from v0.x to v1.x. Three cache options were removed, two were renamed, and the default evaluation mode is in-process. A bare model invents names.
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm bumping `github.com/open-feature/go-sdk-contrib/providers/go-feature-flag` from v0.2.x to v1.x and the build breaks on our options struct:

```go
provider, err := gofeatureflag.NewProvider(gofeatureflag.ProviderOptions{
	Endpoint:             os.Getenv("GOFF_ENDPOINT"),
	DisableCache:         false,
	FlagCacheSize:        5000,
	FlagCacheTTL:         time.Minute,
	DataFlushInterval:    30 * time.Second,
	DisableDataCollector: false,
})
```

For each of the five fields after `Endpoint`, tell me whether it is gone in v1 or what it is called now. Also: if I leave the evaluation type unset in v1, does the provider evaluate in-process or call the proxy per evaluation?

end your reply with exactly these six lines, in this order, filling in the right-hand side. Use `REMOVED` for a field with no replacement, otherwise the exact v1 field name. For the last line use `INPROCESS` or `REMOTE`.

DisableCache: ...
FlagCacheSize: ...
FlagCacheTTL: ...
DataFlushInterval: ...
DisableDataCollector: ...
DefaultEvaluation: ...
