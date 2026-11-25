/** Pure selection and error-classification logic. No pi imports, so it is unit-testable. */

/** Per-entry exhaustion deadlines (epoch ms), keyed by `provider/model`. */
export type Exhausted = Record<string, number>;

const USAGE_LIMIT =
	/usage.?limit|out of (?:usage|credits?|quota)|run out of|quota|insufficient.?(?:credits?|balance|funds)|credit balance|billing|limit (?:reached|exceeded)|exceeded.{0,40}(?:limit|plan|allowance)|payment.?required|\b402\b|no (?:remaining )?(?:credits|usage)/i;

/** Whether a provider error means the account has no usage left (as opposed to a transient failure). */
export function isUsageLimitError(errorMessage: string | undefined): boolean {
	return !!errorMessage && USAGE_LIMIT.test(errorMessage);
}

export function isExhausted(exhausted: Exhausted, key: string, now: number): boolean {
	return (exhausted[key] ?? 0) > now;
}

/**
 * Pick the entry for a request.
 * - `sticky` (the model that served the turn so far) is kept while it is still usable, so tool
 *   follow-ups and retries keep their prompt cache.
 * - Otherwise the first usable entry in list order wins, so a recovered primary is preferred again.
 * - If everything is exhausted, the entry that recovers soonest is used so the real error surfaces.
 */
export function pickEntry(
	entries: readonly string[],
	exhausted: Exhausted,
	now: number,
	sticky?: string,
): string | undefined {
	if (sticky && entries.includes(sticky) && !isExhausted(exhausted, sticky, now)) return sticky;
	const free = entries.find((entry) => !isExhausted(exhausted, entry, now));
	if (free) return free;
	return [...entries].sort((a, b) => (exhausted[a] ?? 0) - (exhausted[b] ?? 0))[0];
}

/** Split `provider/model-id`; the model id may itself contain slashes. */
export function parseEntry(entry: string): { provider: string; id: string } | undefined {
	const slash = entry.indexOf("/");
	if (slash <= 0 || slash === entry.length - 1) return undefined;
	return { provider: entry.slice(0, slash), id: entry.slice(slash + 1) };
}

/**
 * Replacement error text that pi's auto-retry treats as transient. Pi never retries quota or
 * billing wording, so the original text must not be echoed here.
 */
export function failoverMessage(alias: string, failed: string, next: string): string {
	return `429 rate limit: ${failed} is out of usage, switching ${alias} to ${next}`;
}
