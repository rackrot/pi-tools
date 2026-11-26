import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { findJjRoot, jjUsable } from "./detect.ts";
import { classify } from "./guard.ts";
import { readStatus } from "./status.ts";

const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");

const HINT = `This repository uses Jujutsu (jj). Use jj, not git, for version control: there is no staging area, and the working copy is a commit (@). Never run interactive jj commands (always pass -m to describe/commit/squash/split, give split a fileset). Read the jj skill before changing history.`;

/** Per-call env so jj and git never wait on an editor, pager or credential prompt. Scoped to this bash call. */
const ENV_PREFIX = "export JJ_EDITOR=false GIT_TERMINAL_PROMPT=0; ";

const active = (cwd: string) => findJjRoot(cwd) !== undefined && jjUsable();

export default function (pi: ExtensionAPI) {
	/** Git commands already nudged about this session; an identical resend is let through. */
	const seen = new Set<string>();

	/** Footer refresh, coalesced: calls during a read fold into one rerun. */
	let running = false;
	let again = false;
	const refresh = async (ctx: {
		cwd: string;
		hasUI: boolean;
		ui: { setStatus(k: string, v?: string): void };
	}) => {
		if (!ctx.hasUI) return;
		if (running) {
			again = true;
			return;
		}
		running = true;
		do {
			again = false;
			ctx.ui.setStatus("jj", active(ctx.cwd) ? await readStatus(ctx.cwd) : undefined);
		} while (again);
		running = false;
	};

	pi.on("session_start", (_event, ctx) => {
		seen.clear();
		void refresh(ctx);
	});
	pi.on("turn_end", (_event, ctx) => void refresh(ctx));
	pi.on("tool_result", (event, ctx) => {
		const command = (event.input as { command?: unknown }).command;
		if (event.toolName === "bash" && typeof command === "string" && /\b(jj|git)\b/.test(command))
			void refresh(ctx);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) ctx.ui.setStatus("jj", undefined);
	});

	// The skill is only contributed inside a jj repo, so git-only sessions pay nothing for it.
	pi.on("resources_discover", (event) =>
		active(event.cwd) ? { skillPaths: [SKILLS_DIR] } : undefined,
	);

	pi.on("before_agent_start", (event, ctx) => {
		const sections = (event.systemPromptOptions.sections ??= {});
		if (active(ctx.cwd)) sections.jj = HINT;
		else delete sections.jj;
	});

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash" || !active(ctx.cwd)) return;
		const input = event.input as { command?: unknown };
		if (typeof input.command !== "string") return;

		const verdict = classify(input.command, seen);
		if (verdict.kind === "block") return { block: true, reason: verdict.reason };
		if (verdict.kind === "confirm") {
			if (!ctx.hasUI) return { block: true, reason: `${verdict.reason} Ask the user first.` };
			if (!(await ctx.ui.confirm("jj: confirm command", `${verdict.reason}\n\n${input.command}`)))
				return { block: true, reason: "The user declined this command." };
		}
		input.command = ENV_PREFIX + input.command;
	});
}
