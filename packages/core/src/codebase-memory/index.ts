import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const BIN = "codebase-memory-mcp";
const run = promisify(execFile);

/**
 * On session start, make sure the codebase-memory-mcp daemon is running and the cwd is indexed, so
 * its graph tools work. No-op when the CLI isn't installed. Runs in the background; never blocks startup.
 */
export default function codebaseMemory(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		void (async () => {
			try {
				await run(BIN, ["daemon", "start"]);
				await run(BIN, [
					"cli",
					"--quiet",
					"index_repository",
					"--repo-path",
					ctx.cwd,
					"--async",
					"true",
				]);
			} catch {
				// CLI missing or failing: the tools simply stay unavailable.
			}
		})();
	});
}
