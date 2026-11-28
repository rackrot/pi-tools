---
name: route-negative-razor-pages-form
description: "Near miss: a Razor Pages (.cshtml + PageModel) form with validation and antiforgery is not a Blazor component; the skill's own boundary sends Razor Pages and MVC views to aspnet-core."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

the contact form on our site stopped saving. Pages/Contact.cshtml has a `<form method="post">` with asp-for inputs and an asp-validation-summary, and Contact.cshtml.cs has `[BindProperty] public ContactInput Input { get; set; }` plus an `OnPostAsync` that returns `Page()` when `!ModelState.IsValid`. since we added a `Phone` property (non-nullable string, not on the form) every post comes back to the same page with no validation message shown. net8.0 Razor Pages app, nullable enabled. what's going on and how do I fix it?
