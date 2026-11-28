---
name: trigger-ef-core-1
description: An EF Core N+1 should load ef-core.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

OrderReportService loops over 2,000 orders and reads order.Customer.Name and order.Lines.Count for each one; the SQL log shows thousands of SELECTs. Rewrite the EF Core query so it runs in one or two round-trips.

The whole service is below; there is nothing else in the repo to look at. Lazy-loading proxies are enabled.

```csharp
public class OrderReportService(ShopDbContext db)
{
    public async Task<List<OrderReportRow>> BuildAsync(DateTime from, CancellationToken ct)
    {
        var orders = await db.Orders.Where(o => o.PlacedAt >= from).ToListAsync(ct);
        var rows = new List<OrderReportRow>();
        foreach (var order in orders)
        {
            rows.Add(new OrderReportRow(order.Id, order.Customer.Name, order.Lines.Count));
        }
        return rows;
    }
}
```
