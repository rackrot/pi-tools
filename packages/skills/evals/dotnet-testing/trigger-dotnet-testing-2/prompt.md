---
name: trigger-dotnet-testing-2
description: Making DateTime.UtcNow code testable in C# should load dotnet-testing. The class is pasted in, because a prompt that only names TokenIssuer.cs sends the model hunting for a file the empty workspace does not have.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I need NUnit tests for the expiry boundary of this class that do not sleep or depend on the real clock. Change the class as little as possible and keep its public constructor. This is all of TokenIssuer.cs, show me the changed class and the tests:

```csharp
public sealed class TokenIssuer
{
    public Token Issue(string subject) =>
        new(subject, ExpiresAt: DateTime.UtcNow.AddMinutes(15));

    public bool IsExpired(Token token) => DateTime.UtcNow >= token.ExpiresAt;
}

public sealed record Token(string Subject, DateTime ExpiresAt);
```
