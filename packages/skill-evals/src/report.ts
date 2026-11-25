import type { Case, RunResult } from "./types.ts";

export interface ArmResult {
	runs: RunResult[];
	score: number;
}

export interface CaseResult {
	case: Case;
	with: ArmResult;
	without?: ArmResult;
	delta?: number;
	notes: string;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function armResult(runs: RunResult[]): ArmResult {
	return { runs, score: mean(runs.map((r) => r.score)) };
}

/** The highest-weight failing grader's explanation in the first failing with-arm run, else the first run error. */
export function notesFor(runs: RunResult[]): string {
	for (const r of runs) {
		const failing = r.graders
			.filter((g) => g.scored && !g.pass)
			.sort((a, b) => b.weight - a.weight)[0];
		if (failing) return `${failing.name}: ${failing.explanation}`.slice(0, 100);
		if (r.error) return r.error.slice(0, 100);
	}
	return "";
}

export function buildCaseResult(
	c: Case,
	withRuns: RunResult[],
	withoutRuns?: RunResult[],
): CaseResult {
	const w = armResult(withRuns);
	const wo = withoutRuns?.length ? armResult(withoutRuns) : undefined;
	return {
		case: c,
		with: w,
		without: wo,
		delta: wo ? w.score - wo.score : undefined,
		notes: notesFor(withRuns),
	};
}

const cost = (r: CaseResult) =>
	[...r.with.runs, ...(r.without?.runs ?? [])].reduce((n, x) => n + x.costUsd, 0);

export function summary(results: CaseResult[], threshold: number) {
	const deltas = results.flatMap((r) => (r.delta === undefined ? [] : [r.delta]));
	return {
		overallScore: mean(results.map((r) => r.with.score)),
		casesPassed: results.filter((r) => r.with.score >= threshold).length,
		casesTotal: results.length,
		meanDelta: deltas.length ? mean(deltas) : undefined,
		costUsd: results.reduce((n, r) => n + cost(r), 0),
	};
}

export function formatTable(results: CaseResult[]): string {
	const twoArm = results.some((r) => r.without);
	const head = twoArm
		? ["CASE", "WITH", "W/OUT", "Δ", "RUNS", "COST", "NOTES"]
		: ["CASE", "SCORE", "RUNS", "COST", "NOTES"];
	const rows = results.map((r) => {
		const base = [r.case.id, r.with.score.toFixed(2)];
		const tail = [
			String(r.with.runs.length),
			`$${cost(r).toFixed(cost(r) < 0.1 ? 3 : 2)}`,
			r.notes,
		];
		return twoArm
			? [
					...base,
					r.without ? r.without.score.toFixed(2) : "-",
					r.delta === undefined ? "-" : `${r.delta >= 0 ? "+" : ""}${r.delta.toFixed(2)}`,
					...tail,
				]
			: [...base, ...tail];
	});
	const widths = head.map((h, i) =>
		Math.min(48, Math.max(h.length, ...rows.map((row) => row[i].length))),
	);
	const line = (cells: string[]) =>
		cells
			.map((c, i) => (i === cells.length - 1 ? c : c.slice(0, widths[i]).padEnd(widths[i])))
			.join("  ");
	return [line(head), ...rows.map(line)].join("\n");
}

export function toJson(results: CaseResult[], threshold: number, partial?: string) {
	return {
		schemaVersion: 1,
		partial: partial !== undefined,
		partialReason: partial,
		aggregates: summary(results, threshold),
		cases: results.map((r) => ({
			name: r.case.id,
			skills: r.case.skills,
			aggregates: { score: r.with.score, delta: r.delta },
			arms: { with: r.with.runs, without: r.without?.runs },
		})),
	};
}
