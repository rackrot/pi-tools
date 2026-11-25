import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { fetchTemplates, listTemplates, validateNames } from "./api.ts";
import { compose, currentTemplates, type Mode, nextTemplates } from "./file.ts";

interface Update {
	templates?: string[];
	custom?: string[];
	mode?: Mode;
	path?: string;
	dryRun?: boolean;
}

/** Shared by the tool and the slash command. Returns a human summary. */
async function applyUpdate(cwd: string, u: Update, signal?: AbortSignal): Promise<string> {
	const rel = u.path ?? ".gitignore";
	const path = resolve(cwd, rel);
	const r = relative(cwd, path);
	if (r.startsWith("..") || !/(^|\/)\.gitignore$/.test(r)) {
		throw new Error(`Refusing to write ${rel}: must be a .gitignore inside the project`);
	}
	const mode = u.mode ?? "add";
	const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
	const current = currentTemplates(existing);
	let templates = current;
	let body = "";
	if (u.templates?.length) {
		const names = validateNames(u.templates, await listTemplates(signal));
		templates = nextTemplates(current, names, mode);
	} else if (mode !== "add" && u.templates) {
		templates = nextTemplates(current, [], mode);
	}
	if (templates.length) body = await fetchTemplates(templates, signal);
	const next = compose(existing, templates, body, u.custom ?? []);
	if (next === existing) return `${r}: no changes`;
	if (!u.dryRun) writeFileSync(path, next);
	const added = next.split("\n").length - existing.split("\n").length;
	return `${u.dryRun ? "[dry run] would update" : "Updated"} ${r}: templates [${templates.join(", ")}], ${added >= 0 ? "+" : ""}${added} lines${u.dryRun ? `\n\n${next}` : ""}`;
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }], details: {} });

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "gitignore",
		label: "Gitignore",
		description:
			"Create or update .gitignore from toptal/gitignore.io templates (e.g. node, python, macos) plus custom patterns. Template output lives in a managed block; other lines are preserved. Use action=list to see valid template names.",
		promptSnippet: "Create/update .gitignore from toptal templates and custom patterns",
		parameters: Type.Object({
			action: Type.Union([Type.Literal("list"), Type.Literal("update")], {
				description:
					"list: available templates (optional filter in `templates[0]`). update: apply changes.",
			}),
			templates: Type.Optional(Type.Array(Type.String(), { description: "Template names." })),
			mode: Type.Optional(
				Type.Union([Type.Literal("add"), Type.Literal("replace"), Type.Literal("remove")], {
					description:
						"add (default) merges with existing templates; replace sets them; remove drops them.",
				}),
			),
			custom: Type.Optional(
				Type.Array(Type.String(), {
					description: "Extra patterns to append if not already present.",
				}),
			),
			path: Type.Optional(
				Type.String({ description: "A .gitignore inside the project. Default: ./.gitignore" }),
			),
			dryRun: Type.Optional(
				Type.Boolean({ description: "Return the resulting file without writing." }),
			),
		}),
		async execute(_id, params, signal, _update, ctx) {
			if (params.action === "list") {
				const filter = params.templates?.[0]?.toLowerCase();
				const all = await listTemplates(signal);
				return text((filter ? all.filter((t) => t.includes(filter)) : all).join("\n"));
			}
			return text(await applyUpdate(ctx.cwd, params, signal));
		},
	});

	pi.registerCommand("gitignore", {
		description:
			"/gitignore <template...> | remove <template...> | custom <pattern...> | list [filter] (no args: prompt)",
		handler: async (args, ctx) => {
			let words = args
				.trim()
				.split(/[\s,]+/)
				.filter(Boolean);
			try {
				if (!words.length) {
					const input = await ctx.ui.input(
						"Templates to add (space/comma separated)",
						"node macos",
					);
					words = (input ?? "").split(/[\s,]+/).filter(Boolean);
					if (!words.length) return;
				}
				const [sub, ...rest] = words;
				if (sub === "list") {
					const all = await listTemplates();
					const f = rest[0]?.toLowerCase();
					ctx.ui.notify((f ? all.filter((t) => t.includes(f)) : all).join(", "), "info");
				} else if (sub === "remove") {
					ctx.ui.notify(await applyUpdate(ctx.cwd, { templates: rest, mode: "remove" }), "info");
				} else if (sub === "custom") {
					ctx.ui.notify(await applyUpdate(ctx.cwd, { custom: rest }), "info");
				} else {
					ctx.ui.notify(await applyUpdate(ctx.cwd, { templates: words }), "info");
				}
			} catch (e) {
				ctx.ui.notify(e instanceof Error ? e.message : String(e), "error");
			}
		},
	});
}
