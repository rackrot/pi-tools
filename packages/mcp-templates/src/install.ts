import { existsSync } from "node:fs";
import { join } from "node:path";
import { editConfig, readConfig, type Scope } from "@rackrot/pi-core/config";
import { isObject, type Json, writeJsonAtomic } from "@rackrot/pi-core/json";
import {
	EXPOSURES,
	envRefs,
	NAME_RE,
	type Template,
	templateDirs,
	validateTemplate,
} from "./catalog.ts";

/** pi's MCP config: global `<agentDir>/mcp.json`, project `<cwd>/.pi/mcp.json` (trusted projects only). */
export function mcpPath(scope: Scope, cwd: string, agentDir: string): string {
	return scope === "global" ? join(agentDir, "mcp.json") : join(cwd, ".pi", "mcp.json");
}

export function readServers(scope: Scope, cwd: string, agentDir: string): Record<string, Json> {
	const s = readConfig(mcpPath(scope, cwd, agentDir)).mcpServers;
	return isObject(s) ? (s as Record<string, Json>) : {};
}

/** Server name -> scopes it is configured in. */
export function installedServers(cwd: string, agentDir: string): Map<string, Scope[]> {
	const out = new Map<string, Scope[]>();
	for (const scope of ["global", "project"] as const)
		for (const name of Object.keys(readServers(scope, cwd, agentDir)))
			out.set(name, [...(out.get(name) ?? []), scope]);
	return out;
}

/** Credentialed or env-driven templates default to the user-level file so nothing sensitive lands in the repo. */
export function defaultScope(t: Template): Scope {
	return t.defaultScope ?? (t.secrets?.length || t.auth === "env" ? "global" : "project");
}

export const unsetSecrets = (t: Template, env: NodeJS.ProcessEnv = process.env): string[] =>
	(t.secrets ?? []).filter((s) => !env[s]);

export interface InstallOptions {
	template: Template;
	cwd: string;
	agentDir: string;
	scope?: Scope;
	/** Server name; defaults to the template id. */
	name?: string;
	exposure?: string;
	overwrite?: boolean;
}

export function installTemplate(o: InstallOptions): {
	path: string;
	name: string;
	scope: Scope;
	replaced: boolean;
} {
	const name = o.name ?? o.template.id;
	if (!NAME_RE.test(name))
		throw new Error(`Invalid server name "${name}": use letters, digits, _ and -`);
	if (o.exposure && !EXPOSURES.includes(o.exposure))
		throw new Error(`Invalid exposure "${o.exposure}": use ${EXPOSURES.join(", ")}`);
	const scope = o.scope ?? defaultScope(o.template);
	const path = mcpPath(scope, o.cwd, o.agentDir);
	const entry: Json = {
		...structuredClone(o.template.entry),
		...(o.exposure && { exposure: o.exposure }),
	};
	let replaced = false;
	editConfig(path, (data) => {
		if (data.mcpServers !== undefined && !isObject(data.mcpServers))
			throw new Error(`${path}: mcpServers is not an object`);
		const servers = (data.mcpServers ?? {}) as Json;
		replaced = name in servers;
		if (replaced && !o.overwrite)
			throw new Error(`Server "${name}" already exists in ${path} (use --yes to overwrite)`);
		return { ...data, mcpServers: { ...servers, [name]: entry } };
	});
	return { path, name, scope, replaced };
}

/** Creates a user template from a configured server (project entries win over global, as in pi). */
export function saveAsTemplate(o: {
	name: string;
	cwd: string;
	agentDir: string;
	scope?: Scope;
	description?: string;
	overwrite?: boolean;
}): { path: string; template: Template } {
	const entry =
		readServers("project", o.cwd, o.agentDir)[o.name] ??
		readServers("global", o.cwd, o.agentDir)[o.name];
	if (!entry) throw new Error(`No server named "${o.name}" in either mcp.json`);
	const secrets = envRefs(entry);
	const description =
		o.description ?? (typeof entry.description === "string" ? entry.description : o.name);
	const template: Template = {
		id: o.name,
		description,
		tags: [],
		entry,
		...(secrets.length && { secrets, auth: "env" as const }),
	};
	const errs = validateTemplate(template);
	if (errs.length) throw new Error(`Cannot save "${o.name}" as a template: ${errs.join("; ")}`);
	const dir = templateDirs(o.cwd, o.agentDir)[o.scope ?? "global"];
	const path = join(dir, `${o.name}.json`);
	if (!o.overwrite && existsSync(path))
		throw new Error(`${path} already exists (use --yes to overwrite)`);
	writeJsonAtomic(path, template);
	return { path, template };
}
