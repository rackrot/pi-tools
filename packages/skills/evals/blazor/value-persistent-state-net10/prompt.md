---
name: value-persistent-state-net10
description: "Value case. A prerender double fetch on net10.0: the skill says to persist with [PersistentState] on a public property plus a ??= guard; the bare model reaches for the older PersistentComponentState service or turns prerendering off."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our orders page hits the database twice whenever someone opens it by URL or presses F5, you can see both queries in the SQL log about 200 ms apart. clicking over to it from the nav menu only runs one. the project targets net10.0 and we want to keep the server-rendered first paint. this is Components/Pages/Orders.razor, please give me the corrected file in full:

```razor
@page "/orders"
@rendermode InteractiveServer
@inject OrderService Orders

@if (orders is null) { <p>Loading...</p> }
else if (orders.Length == 0) { <p>No orders yet.</p> }
else { @foreach (var o in orders) { <OrderRow @key="o.Id" Order="o" /> } }

@code {
    private OrderSummary[]? orders;

    protected override async Task OnInitializedAsync()
    {
        orders = await Orders.GetRecentAsync();
    }
}
```
