const BASE = "https://www.toptal.com/developers/gitignore/api";

async function get(url: string, signal?: AbortSignal): Promise<string> {
	const res = await fetch(url, {
		signal: AbortSignal.any([AbortSignal.timeout(15_000), ...(signal ? [signal] : [])]),
	});
	if (!res.ok) throw new Error(`gitignore API ${res.status} for ${url}`);
	return res.text();
}

export async function listTemplates(signal?: AbortSignal): Promise<string[]> {
	return (await get(`${BASE}/list?format=lines`, signal)).split("\n").filter(Boolean);
}

/** Returns the merged template body without toptal's header/footer comments. */
export async function fetchTemplates(names: string[], signal?: AbortSignal): Promise<string> {
	const raw = await get(`${BASE}/${names.map(encodeURIComponent).join(",")}`, signal);
	return raw
		.split("\n")
		.filter(
			(l) =>
				!/^# (Created by|End of) https:\/\/www\.toptal\.com|^# https:\/\/www\.toptal\.com/.test(l),
		)
		.join("\n")
		.trim();
}

/** Lowercases names, rejects unknown ones with close suggestions. */
export function validateNames(names: string[], available: string[]): string[] {
	const set = new Set(available);
	const out = names.map((n) => n.trim().toLowerCase()).filter(Boolean);
	const bad = out.filter((n) => !set.has(n));
	if (bad.length) {
		const hints = bad.map((b) => {
			const close = available.filter((a) => a.includes(b) || b.includes(a)).slice(0, 5);
			return close.length ? `${b} (did you mean: ${close.join(", ")}?)` : b;
		});
		throw new Error(`Unknown gitignore template(s): ${hints.join("; ")}`);
	}
	return out;
}
