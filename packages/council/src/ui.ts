import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { type Component, Input } from "@earendil-works/pi-tui";
import { configPath } from "@rackrot/pi-core/config";
import { type ConfigRow, filterPicker, openConfigScreen } from "@rackrot/pi-core/config-ui";
import { loadConfig } from "./config.ts";
import { buildRows, type Row, readLayer, saveLayer, UNSET } from "./edit.ts";

type Scope = "global" | "project";

function modelPicker(models: string[], current: string, done: (v?: string) => void): Component {
	const items = [UNSET, ...models].map((value) => ({
		value,
		label: value === UNSET ? "unset (use the session's model)" : value,
	}));
	return filterPicker(items, done, current);
}

function textEditor(initial: string, done: (v?: string) => void): Component {
	const input = new Input({ prompt: "> " });
	input.setValue(initial);
	input.onSubmit = (v) => done(v);
	input.onEscape = () => done();
	return input;
}

/** Opens the council settings screen. Resolves true when anything was saved. */
export async function openSettings(ctx: ExtensionCommandContext): Promise<boolean> {
	let dirty = false;
	const cwd = ctx.cwd;
	let scope: Scope = "global";
	const pathOf = (s: Scope) => configPath(s, cwd);
	const models = [
		...new Set(
			ctx.modelRegistry
				.getAvailable()
				.filter((m) => m.api !== "pi-virtual")
				.map((m) => `${m.provider}/${m.id}`),
		),
	].sort();

	const toItem = (r: Row): ConfigRow => ({
		id: r.id,
		group: r.group,
		label: r.label,
		description: r.description,
		currentValue: r.current,
		values: r.values,
		submenu:
			r.submenu === "model"
				? (cur, done) => modelPicker(models, cur, done)
				: r.submenu === "text"
					? (cur, done) => textEditor(cur === UNSET || cur === "name…" ? "" : cur, done)
					: undefined,
	});
	const build = (scope: Scope) => buildRows(readLayer(pathOf(scope)), loadConfig(cwd));

	await openConfigScreen(ctx, {
		title: "Council",
		pathOf,
		reload: true,
		rows: (scope) => build(scope).map(toItem),
		apply: (scope, id, next) => {
			const row = build(scope).find((r) => r.id === id);
			if (row) {
				saveLayer(pathOf(scope), (c) => row.apply(c, next));
				dirty = true;
			}
		},
	});
	return dirty;
}
