import { parse } from "shell-quote";

export type Verdict =
	| { kind: "allow" }
	| { kind: "block"; reason: string }
	| { kind: "confirm"; reason: string };

const WRAPPERS = new Set(["env", "command", "exec", "nohup", "time"]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash"]);

/** jj global options that take a separate value, so the value is not mistaken for the subcommand. */
const VALUE_FLAGS = new Set([
	"-R",
	"--repository",
	"--at-op",
	"--at-operation",
	"--config",
	"--config-file",
	"--color",
]);

const CONFIRM = [
	["git", "push"],
	["op", "restore"],
	["op", "abandon"],
	["util", "gc"],
	["workspace", "forget"],
];

const READ_ONLY = new Set([
	"log",
	"st",
	"status",
	"diff",
	"show",
	"evolog",
	"help",
	"version",
	"root",
]);
const READ_ONLY_PAIRS = new Set([
	"op log",
	"op show",
	"op diff",
	"bookmark list",
	"file list",
	"file show",
	"file search",
	"config get",
	"config list",
	"workspace list",
	"tag list",
]);

const NUDGE =
	"This is a jj repository: use jj instead of git (see the jj skill). If you really need this exact git command, send it again.";

/** Word lists of the simple commands in a shell line, with env/command wrappers and VAR=x prefixes removed. */
export function simpleCommands(line: string): string[][] {
	const out: string[][] = [];
	let cur: string[] = [];
	const flush = () => {
		const words = stripPrefixes(cur);
		cur = [];
		if (!words.length) return;
		const inner = shellInline(words);
		if (inner) out.push(...simpleCommands(inner));
		else out.push(words);
	};
	for (const tok of parse(line, (k) => `$${k}`)) {
		if (typeof tok === "string") cur.push(tok);
		else if ("op" in tok && tok.op === "glob") cur.push(tok.pattern);
		else if ("op" in tok) flush();
	}
	flush();
	return out;
}

function stripPrefixes(words: string[]): string[] {
	let i = 0;
	for (;;) {
		const w = words[i];
		if (w === undefined) return [];
		if (/^[A-Za-z_]\w*=/.test(w) || (i > 0 && w.startsWith("-") && WRAPPERS.has(words[0] ?? "")))
			i++;
		else if (WRAPPERS.has(base(w))) i++;
		else return words.slice(i);
	}
}

/** The script of `bash -c '...'`, so a wrapped git or jj call is still seen. */
function shellInline(words: string[]): string | undefined {
	if (!SHELLS.has(base(words[0] ?? ""))) return undefined;
	const at = words.findIndex((w) => /^-\w*c\w*$/.test(w));
	return at > 0 ? words[at + 1] : undefined;
}

const base = (w: string) => w.slice(w.lastIndexOf("/") + 1);

/** Subcommand words of a jj call, after its global options. */
function jjSubcommand(args: string[]): string[] {
	const sub: string[] = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i] as string;
		if (a.startsWith("-")) {
			if (!a.includes("=") && VALUE_FLAGS.has(a)) i++;
			continue;
		}
		sub.push(a);
		if (sub.length === 2) break;
	}
	return sub;
}

function jjVerdict(args: string[]): Verdict {
	const sub = jjSubcommand(args);
	const flags = args.filter((a) => a.startsWith("-")).map((a) => a.split("=")[0]);
	const readOnly = READ_ONLY.has(sub[0] ?? "") || READ_ONLY_PAIRS.has(sub.join(" "));
	if (flags.includes("--ignore-working-copy") && !readOnly) {
		return {
			kind: "block",
			reason:
				"--ignore-working-copy skips the snapshot, so this would act on a stale working copy. Drop the flag.",
		};
	}
	if (flags.includes("--ignore-immutable")) {
		return { kind: "confirm", reason: "--ignore-immutable rewrites commits jj protects." };
	}
	if (CONFIRM.some((c) => c.every((w, i) => sub[i] === w))) {
		return {
			kind: "confirm",
			reason: `jj ${sub.join(" ")} is hard to undo and needs your approval.`,
		};
	}
	return { kind: "allow" };
}

/**
 * Judges one bash command inside a jj repository. `seen` holds git commands already nudged about:
 * the first time a git command is sent it is blocked with a reminder, an identical resend passes.
 * jj confirmations are not remembered; they ask every time.
 */
export function classify(command: string, seen: Set<string>): Verdict {
	const calls = simpleCommands(command);
	for (const words of calls) {
		if (base(words[0] ?? "") !== "jj") continue;
		const v = jjVerdict(words.slice(1));
		if (v.kind !== "allow") return v;
	}
	if (calls.some((w) => base(w[0] ?? "") === "git")) {
		const key = command.trim().replace(/\s+/g, " ");
		if (!seen.has(key)) {
			seen.add(key);
			return { kind: "block", reason: NUDGE };
		}
	}
	return { kind: "allow" };
}
