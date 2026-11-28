---
name: route-implicit-gc-churn-inline-method
description: "Routing, implicit. A latency and gen0 regression with the offending C# method pasted inline routes to dotnet-performance without the words performance, hot path, benchmark or allocation. The code is in the prompt so the model has nothing to search the workspace for."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our ingest endpoint's p99 doubled after we added tag normalisation last sprint, and gen0 collections went from about 40/s to about 600/s under the same load. the flame graph points at this method, it runs once per event at roughly 30k events/s. what in here is hurting us and what would you change first? we're on net8.0.

```csharp
public static string NormalizeTags(string raw)
{
    var parts = raw.Split(',');
    var result = "";
    foreach (var p in parts.Where(x => x.Trim().Length > 0))
    {
        var t = p.Trim().ToLower().Replace(" ", "-").Replace("_", "-").Replace(".", "-");
        if (Regex.IsMatch(t, "^[a-z0-9-]+$"))
            result += t + ",";
    }
    return result.TrimEnd(',');
}
```
