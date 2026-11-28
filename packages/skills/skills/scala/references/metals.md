# Metals language server

Contents: prerequisites, first start, troubleshooting, security.

This applies only when the host provides a Metals or LSP tool, or the user asks to set Metals up. Without one, find symbols with Grep and compile with the build tool.

## Prerequisites

Checked against the Metals docs on 2026-10-20 (latest stable 1.6.9, released 2026-09-14):

1. A JDK for the Metals server. The minimum is 11; the VS Code docs list 11, 17 and 21 with 17 as the default. Metals uses `JAVA_HOME` if set. The project's own JDK (what sbt and Mill use) is separate and also comes from `JAVA_HOME` unless the `javaHome` setting overrides it.
2. Coursier (`cs`), https://get-coursier.io.
3. Install Metals and put it on the PATH:

   ```sh
   cs install metals            # installs a `metals` launcher into the coursier bin dir
   cs bootstrap org.scalameta:metals_2.13:1.6.9 -o metals -f   # alternative: pin a version
   ```

   The coursier bin dir (`cs install` prints it; usually `~/.local/share/coursier/bin`) must be on the PATH of the process that starts the language server. Check with `command -v metals`.
4. A buildable project: an sbt, Mill, Maven, Gradle or Bazel build, or Scala CLI files. Metals imports through Bloop (Mill: automatic via Bloop) or the build's own BSP support.

## First start

Metals imports the build and indexes it before diagnostics and symbol search work, so the first start in a project can take minutes. Until the import and first compile finish, Metals reports parser-only `scalameta` diagnostics, which can be wrong for Scala 3 syntax.

- The import needs `sbt` to run from the environment the server inherits. A `mise` shim without an active version fails there; check `sbt --version` in the project directory first. A second sbt on the same machine can hold `~/.ivy2/.sbt.ivy.lock` and stall the import (`waiting for lock`).
- To import by hand (for example for a build that needs special flags), run `sbt -Dbloop.export-jar-classifiers=sources bloopInstall` once (needs the sbt-bloop plugin; checked against scalameta.org/metals/docs/build-tools/sbt on 2026-10-20) and Metals connects to Bloop on its next start.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No server for `.scala` files | `command -v metals` in the shell that started the client; fix the PATH and restart |
| `metals: command not found` | the coursier bin dir is missing from PATH |
| Starts, then no diagnostics | the build import has not finished or failed; run the build tool in the project and look at `.metals/metals.log` |
| Wrong Scala or Java | `JAVA_HOME`, `scalaVersion`, the `javaHome` setting |
| Crash loop | delete `.metals/` and `.bloop/` in the project and retry |

Metals writes `.metals/`, `.bloop/` and `project/metals.sbt` into the project. Make sure they are in `.gitignore` before committing.

## Security

A build import runs sbt, Bloop or the project's other build tool, which executes the project's build definition (`build.sbt`, plugins, `build.mill`) and any `.bsp/*.json` build server command. Only import projects you trust, as with any IDE import.
