import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readConfigLayers } from "../config.ts";
import { isObject } from "../json.ts";

const BIN = "codebase-memory-mcp";
const exec = promisify(execFile);
const run = (args: string[]) => exec(BIN, args, { timeout: 60_000 });

/** `codebaseMemory.enabled` from the rackrot config, project over global; on unless set to false. */
export function codebaseMemoryEnabled(layers: unknown[]): boolean {
	const set = layers
		.map((l) => (isObject(l) ? l.enabled : undefined))
		.filter((v) => v !== undefined);
	return set.at(-1) !== false;
}

/**
 * On session start, make sure the codebase-memory-mcp daemon is running and the cwd is indexed, so
 * its graph tools work. No-op when the CLI isn't installed, when `codebaseMemory.enabled` is false,
 * and in sessions without a UI (subagents, print mode), which would only repeat the main session's
 * work. Runs in the background; never blocks startup.
 */
export default function codebaseMemory(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		if (!ctx.hasUI || !codebaseMemoryEnabled(readConfigLayers("codebaseMemory", ctx.cwd))) return;
		void (async () => {
			try {
				await run(["daemon", "start"]);
				await run([
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
