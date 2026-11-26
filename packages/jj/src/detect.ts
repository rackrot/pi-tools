import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/** Oldest jj the skill's commands are written for (`bookmark`, `rebase --onto`, `split -m`). */
export const MIN_JJ = [0, 30, 0] as const;

/** Nearest ancestor of `cwd` (inclusive) containing `.jj`, or undefined. */
export function findJjRoot(cwd: string): string | undefined {
	for (let dir = cwd; ; dir = dirname(dir)) {
		if (existsSync(join(dir, ".jj"))) return dir;
		if (dirname(dir) === dir) return undefined;
	}
}

/** Parses `jj 0.47.1-abc` into [0, 47, 1]. */
export function parseVersion(out: string): number[] | undefined {
	const m = /(\d+)\.(\d+)\.(\d+)/.exec(out);
	return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : undefined;
}

export function atLeast(v: readonly number[], min: readonly number[]): boolean {
	for (let i = 0; i < min.length; i++) {
		if ((v[i] ?? 0) !== min[i]) return (v[i] ?? 0) > (min[i] ?? 0);
	}
	return true;
}

let usable: boolean | undefined;

/** True when `jj` is on PATH and at least MIN_JJ. Checked once per process. */
export function jjUsable(): boolean {
	if (usable !== undefined) return usable;
	try {
		const v = parseVersion(execFileSync("jj", ["--version"], { encoding: "utf8", timeout: 5000 }));
		usable = v !== undefined && atLeast(v, MIN_JJ);
	} catch {
		usable = false;
	}
	return usable;
}
