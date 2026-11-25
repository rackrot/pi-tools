export type Mode = "add" | "replace" | "remove";

const START = /^# >>> pi-gitignore: (.*) >>>$/m;
const END = "# <<< pi-gitignore <<<";
const CUSTOM_HEADER = "# custom";

/** Template names recorded in the managed block, if any. */
export function currentTemplates(content: string): string[] {
	const m = START.exec(content);
	return m?.[1] ? m[1].split(",").filter(Boolean) : [];
}

export function nextTemplates(current: string[], names: string[], mode: Mode): string[] {
	if (mode === "replace") return [...new Set(names)];
	if (mode === "remove") return current.filter((t) => !names.includes(t));
	return [...new Set([...current, ...names])];
}

/**
 * Rewrites the managed block with `body` for `templates` (removing it when
 * empty) and appends missing `custom` lines. Everything else is preserved.
 */
export function compose(
	content: string,
	templates: string[],
	body: string,
	custom: string[],
): string {
	const start = START.exec(content);
	const endIdx = content.indexOf(END);
	let before = content;
	let after = "";
	if (start && endIdx > start.index) {
		before = content.slice(0, start.index);
		after = content.slice(endIdx + END.length);
	}
	const block = templates.length
		? `# >>> pi-gitignore: ${templates.join(",")} >>>\n${body}\n${END}`
		: "";
	let out = [before.trimEnd(), block, after.trim()].filter(Boolean).join("\n\n");

	const have = new Set(out.split("\n").map((l) => l.trim()));
	const missing = [...new Set(custom.map((c) => c.trim()).filter(Boolean))].filter(
		(c) => !have.has(c),
	);
	if (missing.length) {
		const header = have.has(CUSTOM_HEADER) ? "" : `\n\n${CUSTOM_HEADER}`;
		out = `${out}${header}\n${missing.join("\n")}`;
	}
	return out ? `${out}\n` : "";
}
