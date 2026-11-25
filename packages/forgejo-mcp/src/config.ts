import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";

export type Exposure = "direct" | "codemode" | "deferred" | "hidden";

export interface ForgejoConfig {
	/** Off unless a settings layer sets `enabled: true` (typically the project's .pi/settings.json). */
	enabled: boolean;
	/** Bare hostname serving forgejo-mcp at /mcp, e.g. git.example.com. */
	host: string;
	/** Access token: literal, `${ENV}`, or `!command` printing the token. Default `${FORGEJO_TOKEN}`. */
	token: string;
	exposure: Exposure;
	/** Hide the tools that are not about repository work (see HIDDEN_BY_DEFAULT). Default true. */
	curate: boolean;
	/** Extra per-tool exposure overrides; merged over the curated defaults. */
	toolExposure: Record<string, Exposure>;
}

/** Notifications, orgs, teams, webhooks, wiki, time tracking, repo create/fork. Ported from the forgejo-mcp Claude plugin. */
export const HIDDEN_BY_DEFAULT = [
	"*notification*",
	"search_users",
	"list_my_orgs",
	"list_user_orgs",
	"get_org",
	"create_org",
	"edit_org",
	"delete_org",
	"list_org_members",
	"check_org_membership",
	"remove_org_member",
	"create_org_label",
	"edit_org_label",
	"delete_org_label",
	"*team*",
	"*_repo_hook*",
	"*_wiki_*",
	"*_tracked_times",
	"*_issue_time*",
	"*stopwatch*",
	"create_repo",
	"fork_repo",
];

const EXPOSURES = new Set<string>(["direct", "codemode", "deferred", "hidden"]);

function readJson(path: string): Record<string, unknown> {
	if (!existsSync(path)) return {};
	try {
		return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/** Parses the merged `forgejoMcp` settings object; `undefined` when no host is set. Global settings can hold defaults (host, token, ...) while each project opts in with `enabled`. */
export function parseConfig(raw: unknown): ForgejoConfig | undefined {
	if (!raw || typeof raw !== "object") return undefined;
	const r = raw as Record<string, unknown>;
	const host =
		typeof r.host === "string"
			? r.host
					.trim()
					.replace(/^https?:\/\//, "")
					.replace(/\/.*$/, "")
			: "";
	if (!host) return undefined;
	const toolExposure: Record<string, Exposure> = {};
	for (const [k, v] of Object.entries((r.toolExposure ?? {}) as Record<string, unknown>)) {
		if (typeof v === "string" && EXPOSURES.has(v)) toolExposure[k] = v as Exposure;
	}
	return {
		enabled: r.enabled === true,
		host,
		token: typeof r.token === "string" && r.token ? r.token : "${FORGEJO_TOKEN}",
		exposure:
			typeof r.exposure === "string" && EXPOSURES.has(r.exposure)
				? (r.exposure as Exposure)
				: "deferred",
		curate: r.curate !== false,
		toolExposure,
	};
}

export function loadConfig(cwd: string = process.cwd()): ForgejoConfig | undefined {
	const global = readJson(join(getAgentDir(), "settings.json")).forgejoMcp;
	const project = readJson(join(cwd, ".pi", "settings.json")).forgejoMcp;
	const g = global && typeof global === "object" ? global : {};
	const p = project && typeof project === "object" ? project : {};
	const c = parseConfig({ ...g, ...p });
	return c?.enabled ? c : undefined;
}

/** `!command` tokens are wrapped so the whole header value is still one command, as pi requires. */
export function authHeader(token: string): string {
	return token.startsWith("!") ? `!echo "token $(${token.slice(1)})"` : `token ${token}`;
}

export function buildServer(c: ForgejoConfig) {
	const toolExposure: Record<string, Exposure> = {};
	if (c.curate) for (const p of HIDDEN_BY_DEFAULT) toolExposure[p] = "hidden";
	Object.assign(toolExposure, c.toolExposure);
	return {
		url: `https://${c.host}/mcp`,
		headers: { Authorization: authHeader(c.token) },
		exposure: c.exposure,
		toolExposure,
		description: `Forgejo (${c.host}): issues, pull requests, reviews, releases, labels, branches, files and Actions runs/logs via API`,
	};
}
