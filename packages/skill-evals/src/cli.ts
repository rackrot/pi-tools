#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { globToRegex, loadCases } from "./cases.ts";
import { buildCaseResult, type CaseResult, formatTable, summary, toJson } from "./report.ts";
import { type Listing, type RunContext, runOnce } from "./run.ts";
import type { Case, RunResult } from "./types.ts";

const USAGE = `pi-skill-eval <evals-dir> --skills-dir <dir> [options]

Runs claude plugin eval style cases (prompt.md + graders/) against pi. Every run is a real model call.

  --skills-dir <dir>     directory of skills (<name>/SKILL.md); repeatable. Default: <evals-dir>/../skills
  --extra-skills <dir>   more skill dirs to resolve names from (e.g. ~/.agents/skills); repeatable
  --case <glob>          filter by case id or name; repeatable
  --tag <tag>            filter by tag; repeatable
  --skill <name>         only cases testing this skill; repeatable
  --runs <n>             runs per case per arm (default: case runs, else 3)
  -j <n>                 parallel runs (default 1)
  --model <pattern>      agent model, e.g. alias/claude-sonnet
  --judge-model <p>      judge model for llm graders (default: --model)
  -e <path>              extension to load in every run, e.g. model-aliases (repeatable)
  --ablation <mode>      with-without (default) | none
  --listing <mode>       description (pi default) | title | hidden; the last two load skill-index
  --skill-index <path>   path to skill-index/src/index.ts (default: sibling package)
  --all-skills           load every skill in every run, so routing has competition
  --allow-tools <t...>   Bash Write Edit (comma separated)
  --scaffold             run each case's scaffold_script (runs as you)
  --threshold <0..1>     pass threshold (default 1)
  --max-cost-usd <n>     stop scheduling runs past this estimate (exit 2)
  --json <path>          write the result as JSON
  --output-dir <dir>     raw event logs and aggregate-result.json (default: <evals-dir>/results/<timestamp>)
  --keep-temp            keep run workspaces
  --list                 load and list cases, no model calls
  --pi <bin>             pi binary (default: pi)
`;

interface Opts {
	evalsDir: string;
	skillsDirs: string[];
	extraSkills: string[];
	cases: string[];
	tags: string[];
	skills: string[];
	runs?: number;
	jobs: number;
	model?: string;
	judgeModel?: string;
	extensions: string[];
	ablation: "with-without" | "none";
	listing: Listing;
	skillIndex?: string;
	allSkills: boolean;
	allowTools: string[];
	scaffold: boolean;
	threshold: number;
	maxCost?: number;
	json?: string;
	outputDir?: string;
	keepTemp: boolean;
	list: boolean;
	pi: string;
}

function parseArgs(argv: string[]): Opts {
	const o: Opts = {
		evalsDir: "",
		skillsDirs: [],
		extraSkills: [],
		cases: [],
		tags: [],
		skills: [],
		jobs: 1,
		extensions: [],
		ablation: "with-without",
		listing: "description",
		allSkills: false,
		allowTools: [],
		scaffold: false,
		threshold: 1,
		keepTemp: false,
		list: false,
		pi: "pi",
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => argv[++i] ?? "";
		if (a === "--skills-dir") o.skillsDirs.push(resolve(next()));
		else if (a === "--extra-skills") o.extraSkills.push(resolve(next()));
		else if (a === "--case") o.cases.push(next());
		else if (a === "--tag") o.tags.push(next());
		else if (a === "--skill") o.skills.push(next());
		else if (a === "--runs") o.runs = Number(next());
		else if (a === "-j") o.jobs = Math.max(1, Number(next()));
		else if (a === "--model") o.model = next();
		else if (a === "--judge-model") o.judgeModel = next();
		else if (a === "-e") o.extensions.push(resolve(next()));
		else if (a === "--ablation") o.ablation = next() === "none" ? "none" : "with-without";
		else if (a === "--listing") o.listing = next() as Listing;
		else if (a === "--skill-index") o.skillIndex = resolve(next());
		else if (a === "--all-skills") o.allSkills = true;
		else if (a === "--allow-tools") o.allowTools.push(...next().split(","));
		else if (a === "--scaffold") o.scaffold = true;
		else if (a === "--threshold") o.threshold = Number(next());
		else if (a === "--max-cost-usd") o.maxCost = Number(next());
		else if (a === "--json") o.json = resolve(next());
		else if (a === "--output-dir") o.outputDir = resolve(next());
		else if (a === "--keep-temp") o.keepTemp = true;
		else if (a === "--list") o.list = true;
		else if (a === "--pi") o.pi = next();
		else if (a === "-h" || a === "--help") {
			console.log(USAGE);
			process.exit(0);
		} else if (!a.startsWith("-") && !o.evalsDir) o.evalsDir = resolve(a);
		else {
			console.error(`unknown option ${a}\n\n${USAGE}`);
			process.exit(1);
		}
	}
	if (!o.evalsDir) {
		console.error(USAGE);
		process.exit(1);
	}
	if (!o.skillsDirs.length) o.skillsDirs.push(join(o.evalsDir, "..", "skills"));
	return o;
}

function skillDirs(roots: string[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const root of roots) {
		if (!existsSync(root)) continue;
		for (const e of readdirSync(root)) {
			const dir = join(root, e);
			if (existsSync(join(dir, "SKILL.md")) && !map.has(e)) map.set(e, dir);
		}
	}
	return map;
}

function select(cases: Case[], o: Opts): Case[] {
	const globs = o.cases.map(globToRegex);
	return cases.filter(
		(c) =>
			(!globs.length || globs.some((g) => g.test(c.id) || g.test(c.name))) &&
			(!o.tags.length || c.tags.some((t) => o.tags.includes(t))) &&
			(!o.skills.length || c.skills.some((s) => o.skills.includes(s))),
	);
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>, stop: () => boolean) {
	let i = 0;
	await Promise.all(
		Array.from({ length: Math.min(n, items.length) }, async () => {
			while (i < items.length && !stop()) await fn(items[i++]);
		}),
	);
}

async function main() {
	const o = parseArgs(process.argv.slice(2));
	const { cases: all, errors } = loadCases(o.evalsDir);
	for (const e of errors) console.error(`load error: ${e}`);
	const cases = select(all, o);
	if (o.list) {
		for (const c of cases)
			console.log(
				`${c.id}\t[${c.skills.join(",")}]\t${c.tags.join(",")}\t${c.graders.length} graders`,
			);
		console.log(`${cases.length} cases (${all.length} loaded, ${errors.length} load errors)`);
		process.exit(errors.length ? 1 : 0);
	}
	if (!cases.length) {
		console.error("no cases selected");
		process.exit(1);
	}

	const dirs = skillDirs([...o.skillsDirs, ...o.extraSkills]);
	const outDir =
		o.outputDir ?? join(o.evalsDir, "results", new Date().toISOString().replace(/[:.]/g, "-"));
	mkdirSync(outDir, { recursive: true });
	const here = dirname(fileURLToPath(import.meta.url));
	const skillIndexPath =
		o.skillIndex ??
		(existsSync(join(here, "../../skill-index/src/index.ts"))
			? join(here, "../../skill-index/src/index.ts")
			: undefined);
	const twoArm = o.ablation === "with-without";
	const ctx: RunContext = {
		piBin: o.pi,
		model: o.model,
		extensions: o.extensions,
		judge: { piBin: o.pi, model: o.judgeModel ?? o.model, extensions: o.extensions, cwd: outDir },
		listing: o.listing,
		skillIndexPath,
		allSkills: o.allSkills,
		skillDirs: dirs,
		allowTools: new Set(o.allowTools),
		scaffold: o.scaffold,
		keepTemp: o.keepTemp,
		outDir,
		twoArm,
	};

	const withRuns = new Map<Case, RunResult[]>();
	const withoutRuns = new Map<Case, RunResult[]>();
	const jobs: { c: Case; arm: "with" | "without"; index: number }[] = [];
	for (const c of cases) {
		const n = o.runs ?? c.runs ?? 3;
		withRuns.set(c, []);
		withoutRuns.set(c, []);
		for (let i = 0; i < n; i++) {
			jobs.push({ c, arm: "with", index: i });
			if (twoArm) jobs.push({ c, arm: "without", index: i });
		}
	}
	console.error(`${cases.length} cases, ${jobs.length} runs. Logs: ${outDir}`);

	let spent = 0;
	let partial: string | undefined;
	let interrupted = false;
	process.on("SIGINT", () => {
		interrupted = true;
		partial = "interrupted";
	});
	await pool(
		jobs,
		o.jobs,
		async ({ c, arm, index }) => {
			const r = await runOnce(c, arm, index, ctx);
			spent += r.costUsd;
			(arm === "with" ? withRuns : withoutRuns).get(c)?.push(r);
			console.error(
				`  ${c.id} ${arm}#${index} ${r.score.toFixed(2)}${r.error ? ` (${r.error})` : ""} $${spent.toFixed(2)}`,
			);
			if (o.maxCost !== undefined && spent > o.maxCost) partial ??= "cost_ceiling";
		},
		() => interrupted || partial !== undefined,
	);

	const results: CaseResult[] = cases
		.filter((c) => withRuns.get(c)?.length)
		.map((c) => buildCaseResult(c, withRuns.get(c) ?? [], withoutRuns.get(c)));
	console.log(formatTable(results));
	const s = summary(results, o.threshold);
	console.log(
		`\n${s.casesPassed}/${s.casesTotal} cases at or above ${o.threshold} · mean score ${s.overallScore.toFixed(2)}${s.meanDelta === undefined ? "" : ` · mean Δ ${s.meanDelta >= 0 ? "+" : ""}${s.meanDelta.toFixed(2)}`} · $${s.costUsd.toFixed(2)}`,
	);
	const json = JSON.stringify(toJson(results, o.threshold, partial), null, 2);
	writeFileSync(join(outDir, "aggregate-result.json"), json);
	if (o.json) writeFileSync(o.json, json);
	if (partial === "interrupted") process.exit(130);
	if (partial) process.exit(2);
	process.exit(s.casesPassed === s.casesTotal ? 0 : 1);
}

main();
