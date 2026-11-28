import {
	type ExtensionAPI,
	type ExtensionCommandContext,
	getAgentDir,
} from "@earendil-works/pi-coding-agent";
import type { Scope } from "@rackrot/pi-core/config";
import { filterPicker } from "@rackrot/pi-core/config-ui";
import { type LoadedTemplate, loadCatalog, NAME_RE } from "./catalog.ts";
import {
	defaultScope,
	installedServers,
	installTemplate,
	mcpPath,
	saveAsTemplate,
	unsetSecrets,
} from "./install.ts";

interface Parsed {
	words: string[];
	flags: Record<string, string>;
	yes: boolean;
}

/** `a b --name x --yes` -> words [a, b], flags {name: x}. Only `--yes` is a bare flag. */
function parse(args: string): Parsed {
	const out: Parsed = { words: [], flags: {}, yes: false };
	const t = args.split(/\s+/).filter(Boolean);
	for (let i = 0; i < t.length; i++) {
		if (t[i] === "--yes") out.yes = true;
		else if (t[i].startsWith("--")) out.flags[t[i].slice(2)] = t[++i] ?? "";
		else out.words.push(t[i]);
	}
	return out;
}

const scopeOf = (v: string | undefined): Scope | undefined | "bad" =>
	v === undefined ? undefined : v === "project" || v === "global" ? v : "bad";

const label = (t: LoadedTemplate) =>
	`${t.id} — ${t.description} [${t.tags.join(", ")}] [source: ${t.origin}]`;

async function add(args: string, ctx: ExtensionCommandContext) {
	const agentDir = getAgentDir();
	const { words, flags, yes } = parse(args);
	const say = (m: string, level: "info" | "warning" | "error" = "info") => ctx.ui.notify(m, level);
	const { templates, problems } = loadCatalog(ctx.cwd, agentDir);
	if (problems.length) say(`Skipped invalid templates:\n${problems.join("\n")}`, "warning");

	let id = words[0];
	if (!id) {
		if (!ctx.hasUI)
			return say(
				"Usage: /mcp-add <id> [--name n] [--scope project|global] [--exposure m] [--yes]",
				"error",
			);
		id = (await ctx.ui.custom<string | undefined>((_t, _th, _kb, done) =>
			filterPicker(
				templates.map((t) => ({ value: t.id, label: label(t) })),
				done,
			),
		)) as string;
		if (!id) return;
	}
	const template = templates.find((t) => t.id === id);
	if (!template) return say(`Unknown template "${id}". See /mcp-templates.`, "error");

	let scope = scopeOf(flags.scope);
	if (scope === "bad") return say("--scope must be project or global", "error");
	if (!scope) {
		const def = defaultScope(template);
		scope = def;
		if (ctx.hasUI && !flags.scope) {
			const pick = await ctx.ui.select(`Scope for ${template.id} (default ${def})`, [
				def,
				def === "global" ? "project" : "global",
			]);
			if (!pick) return;
			scope = pick as Scope;
		}
	}
	let name = flags.name ?? template.id;
	if (ctx.hasUI && !flags.name) name = (await ctx.ui.input("Server name", name)) || name;
	if (!NAME_RE.test(name))
		return say(`Invalid server name "${name}": use letters, digits, _ and -`, "error");

	const unset = unsetSecrets(template);
	if (ctx.hasUI && !yes) {
		const entry = JSON.stringify(
			{ ...template.entry, ...(flags.exposure && { exposure: flags.exposure }) },
			null,
			2,
		);
		const lines = [
			`${name} -> ${mcpPath(scope, ctx.cwd, agentDir)}`,
			entry,
			...(template.requires?.length ? [`Requires: ${template.requires.join(", ")}`] : []),
			...(template.secrets?.length ? [`Secrets (env vars): ${template.secrets.join(", ")}`] : []),
			...unset.map((s) => `WARNING: ${s} is not set in this environment`),
		];
		if (!(await ctx.ui.confirm("Add MCP server", lines.join("\n")))) return;
	}

	const base = { template, cwd: ctx.cwd, agentDir, scope, name, exposure: flags.exposure };
	let res: ReturnType<typeof installTemplate>;
	try {
		try {
			res = installTemplate({ ...base, overwrite: yes });
		} catch (e) {
			// Only a name conflict is worth asking about; anything else is reported below.
			if (yes || !ctx.hasUI || !/already exists/.test((e as Error).message)) throw e;
			if (
				!(await ctx.ui.confirm(
					"Overwrite?",
					(e as Error).message.replace(" (use --yes to overwrite)", ""),
				))
			)
				return;
			res = installTemplate({ ...base, overwrite: true });
		}
	} catch (e) {
		return say((e as Error).message, "error");
	}
	const next = [
		`${res.replaced ? "Replaced" : "Added"} "${res.name}" in ${res.path}`,
		...(res.scope === "project" ? ["Project servers load only in a trusted project."] : []),
		"Run /reload to start it.",
		...(template.auth === "oauth" ? [`Then sign in: /mcp login ${res.name}`] : []),
		...(template.secrets?.length
			? [
					`Export ${template.secrets.join(", ")} before starting pi (or replace a value in the file with a "!command" that prints it).`,
					...unset.map((s) => `Not set now: ${s}`),
				]
			: []),
	];
	say(next.join("\n"));
}

async function list(args: string, ctx: ExtensionCommandContext) {
	const agentDir = getAgentDir();
	const { words, flags, yes } = parse(args);
	const { templates, problems } = loadCatalog(ctx.cwd, agentDir);
	const say = (m: string, level: "info" | "warning" | "error" = "info") => ctx.ui.notify(m, level);
	if (problems.length) say(`Skipped invalid templates:\n${problems.join("\n")}`, "warning");
	const [sub, arg] = words;
	if (sub === "show") {
		const t = templates.find((x) => x.id === arg);
		if (!t) return say(`Unknown template "${arg}"`, "error");
		return say(
			[
				label(t),
				JSON.stringify(t.entry, null, 2),
				`auth: ${t.auth ?? "none"}`,
				...(t.requires?.length ? [`requires: ${t.requires.join(", ")}`] : []),
				...(t.secrets?.length ? [`secrets: ${t.secrets.join(", ")}`] : []),
				...(t.source ? [`docs: ${t.source}`] : []),
			].join("\n"),
		);
	}
	if (sub === "save") {
		const scope = scopeOf(flags.scope);
		if (!arg || scope === "bad")
			return say(
				"Usage: /mcp-templates save <server-name> [--scope project|global] [--yes]",
				"error",
			);
		let description: string | undefined;
		if (ctx.hasUI) description = (await ctx.ui.input("Template description", arg)) || undefined;
		try {
			const r = saveAsTemplate({
				name: arg,
				cwd: ctx.cwd,
				agentDir,
				scope,
				description,
				overwrite: yes,
			});
			return say(`Saved template "${arg}" to ${r.path}`);
		} catch (e) {
			return say((e as Error).message, "error");
		}
	}
	if (sub) return say("Usage: /mcp-templates [show <id> | save <server-name>]", "error");
	const installed = installedServers(ctx.cwd, agentDir);
	say(
		templates.map((t) => `${installed.has(t.id) ? "*" : " "} ${label(t)}`).join("\n") +
			"\n(* = a server with this name is configured)",
	);
}

/** Template layer over pi's native MCP support: writes server entries into mcp.json. */
export default function (pi: ExtensionAPI) {
	pi.registerCommand("mcp-add", {
		description: "/mcp-add [id] [--name n] [--scope project|global] [--exposure mode] [--yes]",
		handler: add,
	});
	pi.registerCommand("mcp-templates", {
		description: "/mcp-templates | show <id> | save <server-name> [--scope project|global] [--yes]",
		handler: list,
	});
}
