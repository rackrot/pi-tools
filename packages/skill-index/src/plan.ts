import { type Config, type Mode, modeOf } from "./config.ts";

export interface SkillInfo {
	name: string;
	description: string;
	filePath: string;
	disableModelInvocation?: boolean;
	sourceInfo?: { scope: string };
}

export interface Plan<T extends SkillInfo = SkillInfo> {
	/** Skills pi should list with name, description and path. */
	listed: T[];
	/** Skills whose body goes into the prompt. */
	full: T[];
	/** Title-only skill names. */
	titles: string[];
	/** Count of skills reachable only through search. */
	hidden: number;
}

/** Splits skills by exposure. Skills with disableModelInvocation stay out of every model-facing list, as in pi. */
export function plan<T extends SkillInfo>(skills: T[], cfg: Config): Plan<T> {
	const p: Plan<T> = { listed: [], full: [], titles: [], hidden: 0 };
	for (const s of skills) {
		if (s.disableModelInvocation) continue;
		const mode: Mode = modeOf(s.name, cfg);
		if (mode === "full") p.full.push(s);
		else if (mode === "description") p.listed.push(s);
		else if (mode === "title") p.titles.push(s.name);
		else p.hidden++;
	}
	return p;
}

/** Prompt section text telling the model how to reach skills that are not listed. Empty when none are unlisted. */
export function indexSection(p: Plan<SkillInfo>): string {
	if (!p.titles.length && !p.hidden) return "";
	const lines = [
		"This list is incomplete: most skills are not shown. You MUST call skill_search with a short description of the task before starting any task that is not trivial, and again whenever the task changes direction. Do this first, before reading code or running commands, and do not skip it because you think you already know how. It returns matching skill names, descriptions and file paths. If a skill fits, read its SKILL.md and follow it; skipping a matching skill is a mistake.",
	];
	if (p.titles.length) lines.push(`Skills by name: ${p.titles.join(", ")}.`);
	if (p.hidden) lines.push(`${p.hidden} more are found only through skill_search.`);
	return lines.join("\n");
}

/** Strips YAML frontmatter from a SKILL.md. */
export function skillBody(text: string): string {
	const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
	return (m ? text.slice(m[0].length) : text).trim();
}
