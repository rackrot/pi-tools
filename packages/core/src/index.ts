import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import cacheTtl from "./cache-ttl/index.ts";
import codebaseMemory from "./codebase-memory/index.ts";
import { registerConfigCommand, registerInitCommand } from "./config-ui.ts";
import contextBar from "./context/bar.ts";
import contextCommand from "./context/index.ts";
import thinkingBinding from "./thinking-binding/index.ts";

/**
 * Core rackrot extension: things we always want installed and enabled.
 * Each feature lives in its own directory and is registered here. Shared code for the other
 * packages lives in `lib.ts` and its submodules, not here.
 */
export default function (pi: ExtensionAPI) {
	thinkingBinding(pi);
	cacheTtl(pi);
	codebaseMemory(pi);
	contextCommand(pi);
	contextBar(pi);
	registerConfigCommand(pi);
	registerInitCommand(pi);
}
