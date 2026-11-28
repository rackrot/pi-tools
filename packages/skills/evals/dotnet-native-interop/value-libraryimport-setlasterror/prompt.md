---
name: value-libraryimport-setlasterror
description: "Accuracy regression case. LibraryImportAttribute has no SetLastPInvokeError property: the named argument stays SetLastError = true (verified with the .NET 10 SDK, SetLastPInvokeError = true is CS0246). The skill once taught the wrong name in SKILL.md and two references, which made the with arm score below the bare model; it is now corrected."
tags: [value, regression]
runs: 3
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

We are turning on PublishAot for a net10.0 Windows CLI (win-x64 only) and SYSLIB1054 flags this one. Convert it to LibraryImport so it compiles and behaves the same:

```csharp
internal static class NativeMethods
{
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    internal static extern bool MoveFileExW(string existing, string? replacement, uint flags);
}
```

Callers do `if (!MoveFileExW(...)) throw new Win32Exception(Marshal.GetLastPInvokeError());` and that must keep working.

Reply with the full converted class in one csharp code block and at most three sentences of explanation.
