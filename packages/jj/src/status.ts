import { execFile } from "node:child_process";

const TEMPLATE =
	'change_id.shortest(8) ++ if(bookmarks, " " ++ bookmarks) ++ if(conflict, " ⚠conflict")';

/**
 * One-line state of `@` for the footer: "<change-id> [bookmarks] [⚠conflict]".
 * Reads with --ignore-working-copy, so it never snapshots or adds an operation; edits made since
 * the last jj command are not reflected. Undefined when jj fails or times out.
 */
export function readStatus(cwd: string): Promise<string | undefined> {
	return new Promise((resolve) => {
		execFile(
			"jj",
			[
				"--no-pager",
				"--color",
				"never",
				"--ignore-working-copy",
				"log",
				"-r",
				"@",
				"--no-graph",
				"-T",
				TEMPLATE,
			],
			{ cwd, encoding: "utf8", timeout: 2000 },
			(err, stdout) => resolve(err ? undefined : stdout.trim() || undefined),
		);
	});
}
