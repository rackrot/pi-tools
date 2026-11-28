---
name: value-post-action-ids
description: "Value case. The restore and add-to-solution post-actions are identified by fixed GUIDs, and a host constraint takes an args array of objects with hostname dotnetcli. A model answering from memory tends to invent a GUID or write the host constraint in another shape."
tags: [value]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

our worker template works, but people keep forgetting the follow-up steps. I want three things added to its template.json:

1. packages are restored automatically right after the project is generated
2. the generated project gets added to the solution file in the folder it's created in
3. the template is only offered from the dotnet command line, it must not show up in Visual Studio

current file:

```json
{
  "$schema": "http://json.schemastore.org/template",
  "author": "Contoso",
  "classifications": ["Worker"],
  "identity": "Contoso.Templates.Worker",
  "name": "Contoso Worker",
  "shortName": "contoso-worker",
  "sourceName": "Contoso.Worker",
  "tags": { "language": "C#", "type": "project" }
}
```

reply with the complete updated template.json.
