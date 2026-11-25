import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { type Json, readJson } from "./json.ts";

/** Settings files in precedence order, lowest first: global, then project. */
export function settingsPaths(cwd: string, agentDir: string = getAgentDir()): string[] {
	return [join(agentDir, "settings.json"), join(cwd, ".pi", "settings.json")];
}

/** The raw value of one settings key from each layer (global, project); `undefined` when unset. */
export function readSettingsLayers(
	key: string,
	cwd: string,
	agentDir: string = getAgentDir(),
): unknown[] {
	return settingsPaths(cwd, agentDir).map((p) => (readJson(p) as Json)[key]);
}
