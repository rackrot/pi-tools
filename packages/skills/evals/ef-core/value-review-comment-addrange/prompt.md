---
name: value-review-comment-addrange
description: "Value case. Three review comments on pasted EF Core 8 code, each judged VALID or INVALID. The target (weight 2) is the comment that Add in a loop runs DetectChanges per call and AddRange fixes it: the skill's Gotchas say Add/AddRange do not call DetectChanges, and bare Haiku accepted the comment in 9 of 9 runs. The two controls (weight 1 each: one false comment, one true) stop a constant answer from passing. Five other gates from the skill were tried here (AsNoTracking on a scalar projection, filtered Include fixup, entity inside a DTO, no-tracking identity, FK index by convention) and dropped because bare Haiku got all of them right."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a teammate left three comments on my pull request (EF Core 8, SQL Server). before I apply or push back on any of them I want to know which ones are technically correct for this code.

Setup: `AppDbContext` is registered with `AddDbContext` (scoped, default tracking behaviour, no lazy loading). `Order` has a `[Timestamp] byte[] RowVersion` concurrency token. `_db` is the request's `AppDbContext` everywhere.

```csharp
// --- A: product import (about 20,000 rows, fresh scope per import)
foreach (var row in rows)
{
    _db.Products.Add(new Product { Sku = row.Sku, Name = row.Name, Price = row.Price });
}
await _db.SaveChangesAsync(ct);

// --- B: category price change
var products = await _db.Products.Where(p => p.CategoryId == categoryId).ToListAsync(ct);
foreach (var p in products)
{
    p.Price = Math.Round(p.Price * factor, 2);
    p.UpdatedAt = now;
}
await _db.SaveChangesAsync(ct);

// --- C: cancel an order
await _db.Orders
    .Where(o => o.Id == orderId)
    .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Cancelled), ct);
```

The comments:

- C1 (on A): "Calling Add inside the loop runs DetectChanges on every call, so this is quadratic. Collect the products in a list and call AddRange once to fix that."
- C2 (on B): "SaveChanges in a loop, that is one round-trip per product. Move it out."
- C3 (on C): "This skips the RowVersion check, a concurrent edit will not raise DbUpdateConcurrencyException. Put the expected RowVersion in the Where and check the affected-row count."

VALID means the comment's technical claim is true for this code as written. INVALID means the claim is false or the proposed change does nothing here. Give a sentence or two of reasoning per comment. Then end your reply with exactly three lines and nothing after them, one per comment: the label, a colon, and the single word VALID or INVALID (the first of the three lines starts with "C1:").
