---
name: trigger-implicit-startup-order
description: "Implicit trigger. AppHost wiring code and a startup-order symptom, the product is never named. Loads aspire."
tags: [trigger]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our orchestration project has this in Program.cs:

```csharp
var rabbit = builder.AddRabbitMQ("messaging");
builder.AddProject<Projects.Orders_Worker>("orders").WithReference(rabbit);
```

Every time I F5 the solution, the orders worker throws BrokerUnreachableException on its first connect and dies, because the broker container is still booting. Nobody wants a retry loop in the worker. What do I change here so it stops happening?
