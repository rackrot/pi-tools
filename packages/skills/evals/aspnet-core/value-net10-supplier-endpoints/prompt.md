---
name: value-net10-supplier-endpoints
description: "Value case. Writing two minimal API endpoints for a net10.0 project from scratch. Graded only on what the bare model gets wrong: AddValidation instead of hand-written checks, a separate response DTO instead of returning the Supplier entity, and (lower weight) the request DTO as a sealed record. Built-in OpenAPI, no Swashbuckle, no WithOpenApi and a declared Results<...> union were tried as graders and dropped because Haiku does them without the skill."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

new project, nothing on disk yet: `dotnet new web`, TargetFramework net10.0, no extra packages. write me the complete Program.cs plus whatever other .cs files you want for two endpoints:

- POST /api/suppliers creates a supplier. Name is required and at most 200 characters, ContactEmail is optional. Invalid input gets a 400 that names the field. Success is 201 with a Location header.
- GET /api/suppliers/{id} returns the supplier or 404.

both must show up in the generated OpenAPI document with their response types. persistence is an `ISupplierStore` with `Task<Supplier?> FindAsync(int id, CancellationToken ct)` and `Task<Supplier> AddAsync(string name, string? contactEmail, CancellationToken ct)` that I already have; just inject it. I can't run anything here, so reply with the full file contents in code blocks and no questions.
