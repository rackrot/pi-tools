export type Json = Record<string, unknown>;

export interface GraderDef {
	/** File name without .md */
	name: string;
	type: string;
	weight: number;
	arm?: "with-only" | "both";
	/** Remaining frontmatter keys. */
	opts: Json;
	/** Markdown body: the rubric for `llm` graders. */
	body: string;
}

export interface Case {
	/** Path under the evals dir, for display and filtering. */
	id: string;
	name: string;
	dir: string;
	/** Skill names under test. */
	skills: string[];
	tags: string[];
	runs?: number;
	maxTurns: number;
	timeoutSeconds: number;
	model?: string;
	allowedTools: string[];
	prompt: string;
	graders: GraderDef[];
	scaffoldScript?: string;
	appendSystemPrompt?: string;
}

export interface ToolCall {
	/** pi tool name, or the synthetic `Skill` call made from reading a SKILL.md. */
	name: string;
	input: unknown;
	/** JSON of `input`, what `input_match` runs against. */
	json: string;
}

export interface RunTrace {
	lastMessage: string;
	toolCalls: ToolCall[];
	/** One JSON line per message. */
	trace: string;
	/** Paths created or changed during the run, relative to the workspace. */
	files: string[];
	readFile(path: string): string | undefined;
}

export interface GraderResult {
	name: string;
	pass: boolean;
	scored: boolean;
	weight: number;
	explanation: string;
}

export interface RunResult {
	arm: "with" | "without";
	score: number;
	graders: GraderResult[];
	costUsd: number;
	durationMs: number;
	error?: string;
	/** Path of the raw event log. */
	log?: string;
}
