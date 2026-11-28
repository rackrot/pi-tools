import { parse } from "shell-quote";

export type Verdict =
	| { kind: "allow" }
	| { kind: "block"; reason: string }
	| { kind: "confirm"; reason: string };

const WRAPPERS = new Set([
	"env",
	"command",
	"exec",
	"nohup",
	"time",
	"sudo",
	"nice",
	"timeout",
	"xargs",
]);
/** Shell words that can precede a command in the same list item (`then git ...`, `{ git ...; }`). */
const KEYWORDS = new Set(["if", "then", "elif", "else", "do", "while", "until", "{", "!"]);
const VCS = new Set(["git", "jj"]);
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
	for (const tok of parse(separate(line), (k) => `$${k}`)) {
		if (typeof tok === "string") cur.push(tok);
		else if ("op" in tok && tok.op === "glob") cur.push(tok.pattern);
		else if ("op" in tok) flush();
	}
	flush();
	return out;
}

/**
 * Turns unquoted newlines and backticks into `;`, which shell-quote would otherwise read as
 * whitespace or word characters, so every line and every `...` substitution is its own command.
 */
function separate(line: string): string {
	let out = "";
	let quote = "";
	for (let i = 0; i < line.length; i++) {
		const c = line[i] as string;
		if (c === "\\" && quote !== "'") {
			// A backslash-newline joins two lines; any other escaped character is kept as written.
			out += line[i + 1] === "\n" ? " " : c + (line[i + 1] ?? "");
			i++;
		} else if (quote) {
			if (c === quote) quote = "";
			out += c;
		} else if (c === "'" || c === '"') {
			quote = c;
			out += c;
		} else if (c === "#" && (i === 0 || /\s/.test(line[i - 1] as string))) {
			// A comment runs to the end of the line; an apostrophe in it must not open a quote.
			while (i + 1 < line.length && line[i + 1] !== "\n") i++;
		} else out += c === "\n" || c === "`" ? " ; " : c;
	}
	return out;
}

function stripPrefixes(words: string[], afterWrapper = false): string[] {
	let i = 0;
	while (
		i < words.length &&
		(/^[A-Za-z_]\w*=/.test(words[i] as string) ||
			KEYWORDS.has(words[i] as string) ||
			(afterWrapper && (words[i] as string).startsWith("-")))
	)
		i++;
	const rest = words.slice(i);
	if (!WRAPPERS.has(base(rest[0] ?? ""))) return rest;
	// A wrapper's options and their values come first (`sudo -u root`, `timeout 5`), so look past them for git or jj.
	const at = rest.findIndex((w, j) => j > 0 && VCS.has(base(w)));
	return at > 0 ? rest.slice(at) : stripPrefixes(rest.slice(1), true);
}

/** The script of `bash -c '...'` or `eval ...`, so a wrapped git or jj call is still seen. */
function shellInline(words: string[]): string | undefined {
	if (words[0] === "eval") return words.slice(1).join(" ");
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

/** Option names of a jj call, without `-m` message text or anything after `--`. */
function jjFlags(args: string[]): string[] {
	const flags: string[] = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i] as string;
		if (a === "--") break;
		if (a === "-m" || a === "--message") i++;
		else if (a.startsWith("-")) flags.push(a.split("=")[0] as string);
	}
	return flags;
}

function jjVerdict(args: string[]): Verdict {
	const sub = jjSubcommand(args);
	const flags = jjFlags(args);
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
