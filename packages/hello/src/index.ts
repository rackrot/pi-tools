import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerCommand("hello", {
		description: "Say hello",
		handler: async (_args, ctx) => {
			ctx.ui.notify("Hello from pi-tools!", "info");
		},
	});
}
