---
name: value-gate-no-hot-path-evidence
description: "Value case. A speed pass over a class with no profile, no benchmark and no claim that it is hot. The skill gate says to report only Critical findings in that situation (here the blocking .Result on an async call) and to leave the rest until profiling shows the code is hot. The bare model changes the cheap ones (string += in a loop, ContainsKey plus indexer, string.Format) and wavers on .Result because the fix changes the method signature."
tags: [value]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

can you do a speed pass over this class before I merge? a script of ours flagged the lines I marked L1 to L6. I have no profiling or benchmark numbers for this service and I honestly don't know how often `Resolve` gets called. tell me for each marked line whether I should change it in this PR.

```csharp
public class TenantSettingsResolver                                   // L6: class is not sealed
{
    private readonly ISettingsStore _store;
    private readonly Dictionary<string, string> _aliases;

    public TenantSettingsResolver(ISettingsStore store, Dictionary<string, string> aliases)
    {
        _store = store;
        _aliases = aliases;
    }

    public TenantSettings Resolve(string host, int shard, int revision)
    {
        string slug = host.Replace("www.", "")
                          .Replace(".example.com", "")
                          .Replace(".", "-");                         // L1: three chained Replace calls
        if (_aliases.ContainsKey(slug))
            slug = _aliases[slug];                                    // L2: ContainsKey then indexer, two lookups
        TenantSettings settings = _store.GetSettingsAsync(slug).Result; // L3: .Result on a Task
        string summary = "";
        foreach (string flag in settings.Flags)
            summary += flag + ";";                                    // L4: += on a string in a loop
        string version = string.Format("{0}.{1}", shard, revision);   // L5: string.Format boxes both ints
        settings.Apply(summary, version);
        return settings;
    }
}
```

a sentence of reasoning per line is fine, then end your reply with exactly six lines in the form `L1: CHANGE` or `L1: LEAVE`, L1 to L6 in order, nothing after them.
