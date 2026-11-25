import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildServer, loadConfig } from "./config.ts";

export default function (pi: ExtensionAPI) {
	const config = loadConfig();
	if (!config) return;
	pi.registerMcpServer("forgejo", buildServer(config));
}
