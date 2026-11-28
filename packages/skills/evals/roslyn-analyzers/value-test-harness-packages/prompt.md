---
name: value-test-harness-packages
description: Value case. Roslyn test harness packages for an xUnit test project; the framework-specific .XUnit packages and XUnitVerifier are obsolete, the generic packages with DefaultVerifier are the answer. The bare model tends to pick the .XUnit packages because the prompt says xUnit.
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

adding a test project for our analyzer package (Acme.Analyzers, C# only). the test project is net9.0 and uses xUnit. ACME0001 has an analyzer and a code fix, ACME0002 is analyzer only. which NuGet packages do I reference for the Roslyn analyzer and code-fix test harness, and which verifier type goes in the last type argument of `CSharpAnalyzerTest<TAnalyzer, TVerifier>`?

end your reply with exactly these three lines, package ids and type name written out in full:

ANALYZER_PACKAGE: <package id>
CODEFIX_PACKAGE: <package id>
VERIFIER: <type name>
