import { spawn } from "node:child_process";
import type { Json } from "./types.ts";

export interface PiResult {
	code: number | null;
	stderr: string;
	timedOut: boolean;
	killed: boolean;
}

/**
 * Runs `pi` with `--mode json` and streams its events. `onEvent` may return true to stop the run.
 * Prompt text always follows `--` so it can start with a dash.
 */
export function runPi(
	piBin: string,
	args: string[],
	prompt: string,
	opts: { cwd: string; timeoutMs: number; onEvent: (event: Json) => boolean | undefined },
): Promise<PiResult> {
	return new Promise((resolve) => {
		const child = spawn(piBin, [...args, "--", prompt], {
			cwd: opts.cwd,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stderr = "";
		let buffer = "";
		let timedOut = false;
		let killed = false;
		const timer = setTimeout(() => {
			timedOut = true;
			child.kill("SIGKILL");
		}, opts.timeoutMs);

		const handle = (line: string) => {
			if (!line.trim() || killed) return;
			let event: Json;
			try {
				event = JSON.parse(line) as Json;
			} catch {
				return;
			}
			if (opts.onEvent(event)) {
				killed = true;
				child.kill("SIGKILL");
			}
		};
		child.stdout.on("data", (chunk: Buffer) => {
			buffer += chunk.toString("utf8");
			let i = buffer.indexOf("\n");
			while (i >= 0) {
				handle(buffer.slice(0, i));
				buffer = buffer.slice(i + 1);
				i = buffer.indexOf("\n");
			}
		});
		child.stderr.on("data", (chunk: Buffer) => {
			stderr = (stderr + chunk.toString("utf8")).slice(-4000);
		});
		child.on("close", (code) => {
			clearTimeout(timer);
			handle(buffer);
			resolve({ code, stderr, timedOut, killed });
		});
		child.on("error", (e) => {
			clearTimeout(timer);
			resolve({ code: null, stderr: String(e), timedOut, killed });
		});
	});
}
