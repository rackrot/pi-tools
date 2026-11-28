import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Case, GraderDef, Json } from "./types.ts";

const SKIP_DIRS = new Set(["results", "fixtures", "graders", "mocks", "node_modules"]);
const GRADER_KEYS = new Set(["type", "weight", "arm"]);

export function splitFrontmatter(text: string): { data: Json; body: string } {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
	if (!m) return { data: {}, body: text };
	const data = parseYaml(m[1]);
	return {
		data: data && typeof data === "object" ? (data as Json) : {},
		body: text.slice(m[0].length),
	};
}

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();

function findCaseDirs(root: string): string[] {
	const out: string[] = [];
	const walk = (dir: string) => {
		if (existsSync(join(dir, "prompt.md")) || existsSync(join(dir, "case.yaml"))) {
			out.push(dir);
			return;
		}
		for (const e of readdirSync(dir)) {
			if (SKIP_DIRS.has(e)) continue;
			const p = join(dir, e);
			if (isDir(p)) walk(p);
		}
	};
	walk(root);
	return out.sort();
}

const asStringList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function toGrader(name: string, data: Json, body: string): GraderDef {
	const opts: Json = {};
	for (const [k, v] of Object.entries(data)) if (!GRADER_KEYS.has(k)) opts[k] = v;
	const arm = data.arm === "with-only" || data.arm === "both" ? data.arm : undefined;
	return {
		name,
		type: String(data.type ?? ""),
		weight: typeof data.weight === "number" && data.weight > 0 ? data.weight : 1,
		arm,
		opts,
		body: body.trim(),
	};
}

export interface LoadResult {
	cases: Case[];
	errors: string[];
}

/** Loads every case under `evalsDir`. Layout: `<skill>/<case>/` or `_suites/<suite>/<case>/` with a `plugins:` list. */
export function loadCases(evalsDir: string): LoadResult {
	const cases: Case[] = [];
	const errors: string[] = [];
	for (const dir of findCaseDirs(evalsDir)) {
		const id = relative(evalsDir, dir).split(sep).join("/");
		try {
			cases.push(loadCase(dir, id));
		} catch (e) {
			errors.push(`${id}: ${e instanceof Error ? e.message : String(e)}`);
		}
	}
	return { cases, errors };
}

function loadCase(dir: string, id: string): Case {
	const yamlPath = join(dir, "case.yaml");
	const y: Json = existsSync(yamlPath)
		? ((parseYaml(readFileSync(yamlPath, "utf8")) as Json) ?? {})
		: {};
	const execution = (y.execution as Json | undefined) ?? {};
	const context = (y.context as Json | undefined) ?? {};

	let fm: Json = {};
	let prompt = typeof execution.prompt === "string" ? execution.prompt : "";
	const promptPath = join(dir, "prompt.md");
	if (existsSync(promptPath)) {
		const parsed = splitFrontmatter(readFileSync(promptPath, "utf8"));
		fm = parsed.data;
		prompt = parsed.body.trim();
	}
	// prompt.md frontmatter wins over case.yaml, as in claude plugin eval.
	const pick = (key: string): unknown => fm[key] ?? execution[key] ?? y[key];

	const graders: GraderDef[] = [];
	for (const g of (y.graders as Json[] | undefined) ?? []) {
		const { criteria, name, ...rest } = g;
		graders.push(
			toGrader(String(name ?? `grader-${graders.length}`), rest, String(criteria ?? "")),
		);
	}
	const gdir = join(dir, "graders");
	if (isDir(gdir)) {
		for (const f of readdirSync(gdir)
			.filter((n) => n.endsWith(".md"))
			.sort()) {
			const parsed = splitFrontmatter(readFileSync(join(gdir, f), "utf8"));
			graders.push(toGrader(basename(f, ".md"), parsed.data, parsed.body));
		}
	}
	if (!graders.length) throw new Error("no graders");
	if (!prompt) throw new Error("no prompt");

	const plugins = asStringList(pick("plugins")).map((p) => basename(p.replace(/\/+$/, "")));
	const first = id.split("/")[0];
	const skills = plugins.length ? plugins : first === "_suites" ? [] : [first];
	if (!skills.length) throw new Error("suite case has no plugins list");

	return {
		id,
		name: String(pick("name") ?? basename(dir)),
		dir,
		skills,
		tags: asStringList(pick("tags")),
		runs: typeof pick("runs") === "number" ? (pick("runs") as number) : undefined,
		maxTurns: typeof pick("max_turns") === "number" ? (pick("max_turns") as number) : 10,
		timeoutSeconds:
			typeof pick("timeout_seconds") === "number" ? (pick("timeout_seconds") as number) : 300,
		model: typeof pick("model") === "string" ? (pick("model") as string) : undefined,
		allowedTools: asStringList(pick("allowed_tools")),
		prompt,
		graders,
		scaffoldScript:
			typeof context.scaffold_script === "string" ? context.scaffold_script : undefined,
		appendSystemPrompt:
			typeof pick("append_system_prompt") === "string"
				? (pick("append_system_prompt") as string)
				: undefined,
	};
}

export function globToRegex(glob: string): RegExp {
	const src = glob
		.split("**")
		.map((part) =>
			part
				.split("*")
				.map((s) => s.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\?/g, "[^/]"))
				.join("[^/]*"),
		)
		.join(".*");
	return new RegExp(`^${src}$`);
}
