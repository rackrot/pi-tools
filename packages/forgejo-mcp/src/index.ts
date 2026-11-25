import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerConfigSection } from "@rackrot/pi-core/config-ui";
import { buildServer, loadConfig } from "./config.ts";

export default function (pi: ExtensionAPI) {
	registerConfigSection({
		id: "forgejo-mcp",
		label: "Forgejo MCP",
		example: {
			forgejoMcp: {
				enabled: false,
				host: "git.example.com",
				token: "${FORGEJO_TOKEN}",
				exposure: "deferred",
				curate: true,
				toolExposure: { "delete_*": "hidden" },
			},
		},
		fields: [
			{
				path: ["forgejoMcp", "enabled"],
				label: "enabled",
				description: "Turn it on per project; set host and token globally.",
				kind: "boolean",
			},
			{ path: ["forgejoMcp", "host"], label: "host", description: "Bare hostname.", kind: "text" },
			{
				path: ["forgejoMcp", "token"],
				label: "token",
				description: "Literal, ${ENV} or !command. Default ${FORGEJO_TOKEN}.",
				kind: "text",
			},
			{
				path: ["forgejoMcp", "exposure"],
				label: "exposure",
				kind: "enum",
				values: ["deferred", "codemode", "direct", "hidden"],
			},
			{
				path: ["forgejoMcp", "curate"],
				label: "curate",
				description: "false exposes all tools.",
				kind: "boolean",
			},
		],
		summary: (ctx) => {
			const c = loadConfig(ctx.cwd);
			return c ? `${c.host}, exposure ${c.exposure}` : "disabled (needs host and enabled: true)";
		},
	});

	const config = loadConfig();
	if (!config) return;
	pi.registerMcpServer("forgejo", buildServer(config));
}
