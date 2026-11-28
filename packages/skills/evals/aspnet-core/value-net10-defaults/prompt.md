---
name: value-net10-defaults
description: "Value case. Three fixed-answer facts about .NET 10 behaviour that the skill states and a model answers from older versions: cookie auth on API endpoints answers 401 instead of redirecting, AddValidation only sees types of the assembly that calls it, the exception handler middleware no longer logs exceptions an IExceptionHandler handled. Facts Haiku already knows without the skill (rate limiter 503, WithOpenApi deprecated, no XML comments from lambdas, OpenAPI 3.1 by default) were tried and dropped."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

we're moving the orders API to .NET 10 (minimal APIs in Program.cs, cookie auth for the browser client). before I update the client code and the runbook I need three facts pinned down. assume stock defaults everywhere, nothing customised beyond what I say.

- Q1: `GET /api/orders` is a MapGet that returns `TypedResults.Ok(...)` and has `.RequireAuthorization()`. Auth is `AddAuthentication().AddCookie()` with default options. A fetch() without the cookie hits it. Which HTTP status code does the client receive?
- Q2: the request DTOs live in a separate class library, Orders.Contracts, with [Required] and [MaxLength] on them. Program.cs in Orders.Api calls `builder.Services.AddValidation()` once and nothing else is done about validation. Are those attributes enforced on the request bodies? YES or NO
- Q3: our IExceptionHandler returns true for ConflictException and does not log anything itself. Does the exception handler middleware still log that exception for us? YES or NO

end your reply with exactly three lines in the form `Q1: 200`, `Q2: YES`, Q1 to Q3 in order, nothing after them.
