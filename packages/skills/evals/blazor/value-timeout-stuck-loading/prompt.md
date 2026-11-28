---
name: value-timeout-stuck-loading
description: "Value case. An HttpClient timeout in OnInitializedAsync with no try/catch: ComponentBase swallows the OperationCanceledException, so the page stays on Loading and no error boundary fires (references/data.md). The bare model expects the ErrorBoundary or the unhandled-error bar."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

QA filed a ticket against our category page and I want to know what the user actually ends up looking at before I reproduce it. The app is a Blazor Web App on net9.0, Interactive Server, prerendering is switched off for this page. MainLayout wraps `@Body` in an `<ErrorBoundary>` with an `<ErrorContent>` that says "Something went wrong". The typed client has `Timeout = TimeSpan.FromSeconds(5)`.

```razor
@page "/category/{CategoryId:int}"
@inject CatalogClient Catalog

@if (products is null) { <p>Loading...</p> }
else { @foreach (var p in products) { <ProductRow @key="p.Id" Product="p" /> } }

@code {
    [Parameter] public int CategoryId { get; set; }
    private Product[]? products;

    protected override async Task OnInitializedAsync()
    {
        products = await Catalog.GetByCategoryAsync(CategoryId);   // http.GetFromJsonAsync<Product[]>(...)
    }
}
```

In the ticket the catalog API hung and never answered. Ten seconds after the user opened the page, which of these is on screen?

A. The layout's "Something went wrong" error content
B. The yellow "An unhandled error has occurred. Reload" bar at the bottom of the page
C. Still "Loading...", with no error shown anywhere
D. An empty page body: no "Loading...", no rows, no error

Explain briefly, then end your reply with exactly one line in this form: `ON_SCREEN: <letter>`
