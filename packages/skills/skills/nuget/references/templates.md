# Authoring and packaging `dotnet new` templates

Contents: deliver what was asked; bootstrap from a project; parameters and conditional content; test locally; package as a template pack; central package management inside a template; snapshot tests and localization; validate a template.json; gotchas.

A template is a working project plus `.template.config/template.json`. Its value is that generated projects keep the source repo's conventions and build cleanly for every parameter combination. Prove both by instantiating and building, not by reading the JSON. Finding, comparing or using existing templates (`dotnet new list`, `dotnet new search`, `dotnet new <name> --help`) is not authoring.

## Deliver what was asked

- "Show", "write" or "give me" the template: put the complete JSON or XML in the reply, even if it was also written to disk.
- Create or change files only when the user asked for file changes and the source project is present.
- Validation only: run the rules and report; don't rewrite the template.

## 1. Bootstrap from an existing project

1. Copy the source project into a dedicated template-source folder (for example `templates/<Name>/`). Leave the original untouched unless the user asks to template it in place.
2. Create `.template.config/template.json` in that folder:

   ```json
   {
     "$schema": "http://json.schemastore.org/template",
     "author": "Contoso",
     "classifications": ["Library"],
     "identity": "Contoso.Templates.Library",
     "name": "Contoso Library",
     "shortName": "contoso-lib",
     "sourceName": "Contoso.Library",
     "defaultName": "MyLibrary",
     "preferNameDirectory": true,
     "tags": { "language": "C#", "type": "project" }
   }
   ```

   `sourceName` is the text replaced by `--name` in file names and contents, so set it to the source project's name. `identity` is reverse-DNS with no spaces. `shortName` must not equal a `dotnet new` subcommand (gotchas below).
3. Carry over the source project's conventions and report each one in a table:

   | Source setting | Carried over? | How |
   |---|---|---|
   | SDK (`Microsoft.NET.Sdk`, `.Web`, `.Worker`) | yes | template `.csproj` keeps the same SDK |
   | `TargetFramework`, `Nullable`, `LangVersion`, `TreatWarningsAsErrors`, `OutputType` | yes | kept verbatim or turned into a parameter |
   | `PrivateAssets` / `IncludeAssets` / `ExcludeAssets` on references | yes | metadata kept |
   | Central Package Management | yes | `PackageReference`s stay versionless; ship `Directory.Packages.props` if self-contained |
   | `Directory.Build.props/targets`, `global.json`, `.editorconfig`, folder layout | yes or no | shipped, or noted as expected from the host repo |

   Mark anything deliberately dropped with the reason. Don't leave omissions implicit.

## 2. Add parameters and conditional content

Read [template-json.md](template-json.md) before writing symbols, conditions, post-actions or constraints. It has the exact structures. The rules that most often go wrong:

- Conditional XML goes inside XML comments: `<!--#if (database == "Postgres") -->` ... `<!--#endif -->`. Bare `#if` lines break the `.csproj`.
- Conditions reference symbols in parentheses: `"condition": "(includeTests)"`.
- Restore post-action: `actionId` `210D431B-A78B-4D2F-B762-4ED3E3EA9025` with `primaryOutputs`, or `args.files` with source-template paths. It takes no `executable` field.
- Host constraint: `"args": [{ "hostname": "dotnetcli" }]`. Use an `sdk-version` constraint to restrict the SDK version.
- Every parameter gets `description`, `datatype` and a `defaultValue` (a choice parameter's default must be one of its choices).

## 3. Test locally (required for a new template)

```bash
dotnet new install ./templates/Contoso.Library          # folder that contains .template.config
dotnet new contoso-lib --help                           # parameters appear here, not in `dotnet new --help`
dotnet new contoso-lib -n Smoke -o /tmp/tpl-smoke --dry-run
dotnet new contoso-lib -n Smoke -o /tmp/tpl-smoke
dotnet build /tmp/tpl-smoke
dotnet new uninstall ./templates/Contoso.Library
```

Repeat the instantiate and build for each meaningful parameter combination (each choice value, each bool flipped). Report every observed result. For regression tests across versions, use snapshot testing (below).

## 4. Package as a template pack

Layout:

```
Contoso.Templates/
  Contoso.Templates.csproj        # the pack project
  templates/
    Contoso.Library/
      .template.config/template.json
      Contoso.Library.csproj
      ...
    Contoso.Worker/
      .template.config/template.json
      ...
```

Pack project:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <PackageId>Contoso.Templates</PackageId>
    <PackageVersion>1.0.0</PackageVersion>
    <Title>Contoso templates</Title>
    <Authors>Contoso</Authors>
    <Description>Project templates for Contoso services.</Description>
    <PackageTags>dotnet-new;templates;contoso</PackageTags>
    <PackageType>Template</PackageType>
    <TargetFramework>net8.0</TargetFramework>
    <IncludeContentInPack>true</IncludeContentInPack>
    <IncludeBuildOutput>false</IncludeBuildOutput>
    <ContentTargetFolders>content</ContentTargetFolders>
    <NoWarn>$(NoWarn);NU5128</NoWarn>
    <NoDefaultExcludes>true</NoDefaultExcludes>
  </PropertyGroup>
  <ItemGroup>
    <Content Include="templates\**\*" Exclude="templates\**\bin\**;templates\**\obj\**" />
    <Compile Remove="**\*" />
  </ItemGroup>
</Project>
```

- `PackageType` `Template` is what makes `dotnet new install <package>` treat it as templates.
- The pack project's `TargetFramework` only satisfies the SDK; it doesn't retarget the template projects. Any supported TFM works.
- `NoDefaultExcludes` keeps dot-files such as `.editorconfig` and `.gitignore` in the package; without it NuGet drops them.
- `NU5128` is suppressed because a content-only package has no `lib/` folder.

Build and try it:

```bash
dotnet pack -c Release -o ./artifacts
dotnet new install ./artifacts/Contoso.Templates.1.0.0.nupkg
dotnet new list contoso
dotnet new uninstall Contoso.Templates
```

Publishing the `.nupkg` (API keys, trusted publishing, feeds): [trusted-publishing.md](trusted-publishing.md).

### Central Package Management inside a template

- Keep `PackageReference` items versionless in template projects that use CPM.
- A self-contained template ships its own `Directory.Packages.props` at the generated repo root, with `<ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>` and a `PackageVersion` for every versionless reference.
- Don't add a second `Directory.Packages.props` nearer the project; MSBuild uses the nearest one and the outer file stops applying.
- An item template or a project template meant to drop into an existing CPM repo ships no props file and relies on the host's.

### Snapshot tests and localization

- Snapshot tests: `Microsoft.TemplateEngine.Authoring.TemplateVerifier` (xUnit-based) instantiates a template with given parameters and compares the output tree to approved snapshots, so later edits show as diffs. The `Microsoft.TemplateEngine.Authoring.CLI` global tool's `verify` command runs the same check from the command line. Both ship with SDK-aligned versions (10.0.x for the .NET 10 SDK); pin to the SDK band you build with.
- CI: run the smoke matrix and snapshot tests on every change to `templates/`.
- Localization: `Microsoft.TemplateEngine.Authoring.Tasks` adds a `localize` step to the pack build that generates `.template.config/localize/templatestrings.<lang>.json` files from `template.json`; translators edit those. The CLI tool's `localize` command does the same on demand.

## 5. Validate a template.json

Parse first. If the JSON doesn't parse, report the parser's line and column and the smallest fix, then stop; semantic findings from a broken file are guesses.

Then check every category in [template-validation-rules.md](template-validation-rules.md): required fields, identity format, shortName conflicts, symbols, source conditions, post-actions, constraints, tags. Report with a one-line verdict and one table:

- `Not ready: N errors, M warnings` / `Publishable with N warnings` / `Ready to publish: 0 errors, 0 warnings`
- Columns: Severity, Location (JSON path or line:col), Issue, Fix. Every error and warning carries a concrete fix (the corrected value or snippet).
- Close with the totals.

## Gotchas

- Reserved shortNames are the `dotnet new` subcommands (`install`, `uninstall`, `update`, `list`, `search`, `details`, `create` on current SDKs). Read the live set from the `Commands:` section of `dotnet new --help`. Top-level verbs (`build`, `test`, `run`, `publish`) do not conflict.
- A template that installs but doesn't show in `dotnet new list` usually has invalid JSON, a missing `identity`/`name`/`shortName`, or a `.template.config` folder not at the root that was installed. `dotnet new install` prints warnings for templates it skipped; read them.
- `args.files` on a restore action matches paths in the source template, before `sourceName` renames.
- A parameter whose name is a prefix of another (`Auth`, `AuthMode`) makes expression parsing ambiguous; rename one.
- Reinstalling from the same folder updates the template; after renaming `identity`, uninstall the old one or both appear.
