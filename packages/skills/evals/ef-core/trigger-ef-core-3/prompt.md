---
name: trigger-ef-core-3
description: Dapper code with cancellation and multi-mapping should load ef-core.
tags: [trigger]
runs: 1
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our InvoiceRepository uses Dapper alongside EF Core. GetWithLinesAsync joins invoices to invoice_lines but returns one Invoice per line, ignores the CancellationToken, and builds the ORDER BY from a query-string value. Fix it.

The method is below; there is nothing else to look at.

```csharp
public async Task<IEnumerable<Invoice>> GetWithLinesAsync(int customerId, string sort, CancellationToken ct)
{
    using var conn = new SqlConnection(_cs);
    var sql = "SELECT i.*, l.* FROM invoices i JOIN invoice_lines l ON l.invoice_id = i.id " +
              "WHERE i.customer_id = @customerId ORDER BY " + sort;
    return await conn.QueryAsync<Invoice, InvoiceLine, Invoice>(sql,
        (i, l) => { i.Lines.Add(l); return i; },
        new { customerId }, splitOn: "id");
}
```
