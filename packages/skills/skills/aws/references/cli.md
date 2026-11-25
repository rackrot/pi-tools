# AWS CLI v2: the quirks that bite

For when the command itself is the problem: truncated output, wrong credentials, a retry that duplicates a resource, a write that must be safe to run.

## Safety rule for writes

For any write (create, update, delete, launch, terminate, put, attach), show the exact command and wait for the user's confirmation before running it. The same applies to a write through the aws-mcp `run_script` or `get_presigned_url` tools; read the `aws-resource-query` skill's `references/aws-mcp.md` before calling them. Pass `--region` explicitly in every script and every write.

- Run `aws --version` first. It must report `aws-cli/2.`; a 1.x or nothing means the wrong binary is first on PATH.
- If the command supports `--dry-run` (check `aws <service> <command> help`), run it first. A `DryRunOperation` error means the request would have succeeded; it is the pass signal, not a failure.
- If it supports `--client-token`, give each logical request a unique token and reuse the same token when retrying it, so the retry does not create a second resource.
- The default read timeout is 60 seconds. For a long call raise it with `--cli-read-timeout <seconds>` (0 means no timeout).

## Credentials and region

- An explicit `--profile` ignores env keys, but `AWS_PROFILE` does not, so env keys win over it. Unset `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`, then confirm with `aws sts get-caller-identity --profile <p>`. To test whether a variable is set without printing it: `[ -n "${AWS_ACCESS_KEY_ID-}" ] && echo set`.
- The CLI has no access-key flag; command-line options are not a way to pass credentials. `aws configure list` and `aws configure export-credentials` stay off-limits (see SKILL.md).
- `--region` beats `AWS_REGION`, which beats `AWS_DEFAULT_REGION`.

## Output

- By default the CLI pages through results itself and returns everything. `--no-paginate` returns only the first page, so a script that uses it silently misses items.
- `--max-items N` caps output and prints a `NextToken`; resume with `--starting-token <token>` (must be non-empty). `--page-size N` only changes how many items each underlying call fetches.
- `--query` takes a JMESPath expression applied to the response. `--output` takes `json`, `yaml`, `yaml-stream`, `text`, `table` or `off`. Use `json` for anything another program parses, `text` for a shell pipeline.
- Disable the pager in scripts with `AWS_PAGER=""` or `--no-cli-pager`.
- Blob parameters are base64-encoded by default (`--cli-binary-format`); use `fileb://` to send a file's raw bytes.

## Waiters and input files

- `aws <service> wait <waiter-name>` polls until a state, then exits 0. Each waiter has its own interval and attempt limit (`aws ec2 wait instance-running`: every 15 seconds, exit 255 after 40 failed checks); read `aws <service> wait help`. A timeout exits non-zero, so check `$?` in scripts.
- `aws <service> <command> --generate-cli-skeleton input > req.json` writes a request template (`yaml-input` for YAML); run it with `--cli-input-json file://req.json` or `--cli-input-yaml`. Skeleton keys are API parameter names (`UserName`), not flag names (`--user-name`), so generate the skeleton rather than guessing. Custom commands such as `aws s3` have no skeletons.

## Debugging

`aws <service> <command> --debug 2>&1 | grep -i retry` shows retries. Do not write debug output to a file in the working directory: it can contain session tokens. Retry settings are `AWS_RETRY_MODE` (`legacy`, `standard`, `adaptive`) and `AWS_MAX_ATTEMPTS`; the docs mark `adaptive` experimental.
