---
name: value-ef10-upgrade-checks
description: "Value case. Five facts about EF Core 10 behaviour taken from the skill's EF 10 reference, answered in a fixed final-line format. Q1 (collection parameters become one parameter per element) and Q3 (injected Application Name splits the pool with Dapper) carry weight 2: bare Haiku answered both with the EF 8/9 behaviour in every run. Q2 (ExecuteUpdateAsync expression-tree setters stop compiling) is weight 1 and bare Haiku is split on it. Q4 (per-migration transactions) and Q5 (--framework for multi-targeted projects) are weight 1 controls bare Haiku gets right. Q2 to Q5 are answered with a word pair per question (COMPILES/BREAKS and so on) because Haiku flipped YES/NO on the negatively phrased versions while reasoning correctly."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our API has been on EF Core 10 since last week (.NET 10, SQL Server 2022, Microsoft.Data.SqlClient, default EF options everywhere, nothing overridden; it was on EF Core 9 before). before I touch the data layer again I need these five points settled for how EF Core 10 behaves.

Q1. `var ids = new[] { 1, 2, 3 }; db.Orders.Where(o => ids.Contains(o.Id))`. Which SQL shape does EF Core 10 produce by default?
  A) `WHERE [o].[Id] IN (1, 2, 3)` with the values inlined
  B) `WHERE [o].[Id] IN (SELECT [i].[value] FROM OPENJSON(@ids) ...)` with one JSON parameter
  C) `WHERE [o].[Id] IN (@ids1, @ids2, @ids3)` with one parameter per element

Q2. A helper of ours builds an `Expression<Func<SetPropertyCalls<Order>, SetPropertyCalls<Order>>>` by hand with `Expression.Call` and passes it to `ExecuteUpdateAsync`. On EF Core 10, does that helper compile as it is (COMPILES) or does it have to be rewritten because it no longer compiles (BREAKS)?

Q3. Our Dapper code opens `new SqlConnection(cs)` with the same connection string the DbContext uses. The string has no `Application Name`. On EF Core 10, do the EF connections and the Dapper connections use one connection pool (SHARED) or two different pools (SEPARATE)?

Q4. A deploy runs `Database.MigrateAsync()` with three pending migrations and the third one fails. On EF Core 10, do the first two migrations stay applied (KEPT) or are they rolled back with the third (ROLLEDBACK)?

Q5. The data project has `<TargetFrameworks>net8.0;net10.0</TargetFrameworks>`. With the EF Core 10 tools, does `dotnet ef migrations add AddOrderStatus` with no extra arguments succeed (WORKS) or stop with an error (FAILS)?

One sentence of reasoning per question is enough. Then end your reply with exactly five lines and nothing after them, one per question: the label, a colon, and your answer, which is a single letter for Q1 and for Q2 to Q5 one of the two capitalised words offered in that question (the first of the five lines starts with "Q1:").
