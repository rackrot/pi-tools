---
name: route-implicit-pasted-slow-report
description: "Routing, implicit. A pasted report method that loads a whole table, filters in memory and queries once per row routes to ef-core without the words EF Core, N+1, DbContext or query tuning; the code is inline so nothing has to be found in the workspace."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

this report used to come back in about 200ms and now takes 9 seconds since we onboarded the big customers. nothing else changed. what is wrong with it and how should I rewrite it? the whole method is below, there is nothing else to look at.

```csharp
public async Task<List<CustomerRow>> GetReportAsync(int year, CancellationToken ct)
{
    var customers = await _db.Customers.ToListAsync(ct);
    var rows = new List<CustomerRow>();
    foreach (var c in customers.Where(c => c.CreatedAt.Year == year))
    {
        var orders = _db.Orders.Where(o => o.CustomerId == c.Id).ToList();
        rows.Add(new CustomerRow(c.Name, orders.Count, orders.Sum(o => o.Total)));
    }
    return rows;
}
```
