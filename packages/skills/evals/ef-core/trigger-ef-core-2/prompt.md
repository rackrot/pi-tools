---
name: trigger-ef-core-2
description: Adding and shipping an EF Core migration should load ef-core.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I renamed the Customer.Phone property to PhoneNumber in our EF Core model. Create the migration, and tell me how we should apply it to production (we run three instances of the API that currently call Database.Migrate() at startup).

Everything relevant is below; the repo has nothing else to open.

```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? PhoneNumber { get; set; } // was Phone
}
```

```csharp
// Program.cs
builder.Services.AddDbContext<ShopDbContext>(o => o.UseSqlServer(cs));
var app = builder.Build();
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<ShopDbContext>().Database.Migrate();
```
