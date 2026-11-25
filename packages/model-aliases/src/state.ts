import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import type { Exhausted } from "./select.ts";

const file = () => join(getAgentDir(), "model-aliases-state.json");

/** Exhaustion deadlines shared across sessions. Re-read on every use so concurrent sessions agree. */
export function loadState(now = Date.now()): Exhausted {
	if (!existsSync(file())) return {};
	try {
		const raw = JSON.parse(readFileSync(file(), "utf8")) as Exhausted;
		return Object.fromEntries(Object.entries(raw).filter(([, until]) => until > now));
	} catch {
		return {};
	}
}

export function saveState(state: Exhausted): void {
	mkdirSync(dirname(file()), { recursive: true });
	const tmp = `${file()}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(state, null, 2));
	renameSync(tmp, file());
}

export function markExhausted(key: string, until: number): void {
	const state = loadState();
	state[key] = until;
	saveState(state);
}

export function clearExhausted(keys?: readonly string[]): void {
	const state = loadState();
	for (const key of keys ?? Object.keys(state)) delete state[key];
	saveState(state);
}
