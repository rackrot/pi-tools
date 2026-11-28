import { execFile } from "node:child_process";
import {
	closeSync,
	existsSync,
	openSync,
	realpathSync,
	rmSync,
	statSync,
	unlinkSync,
} from "node:fs";
import { basename, join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs git with an argument array (never a shell) against `dir`; resolves stdout. */
export async function git(dir: string, args: string[]): Promise<string> {
	const { stdout } = await exec("git", ["-C", dir, ...args], {
		env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
		timeout: 120_000,
		maxBuffer: 16 * 1024 * 1024,
	});
	return stdout;
}

const ok = (dir: string, args: string[]) =>
	git(dir, args).then(
		() => true,
		() => false,
	);

/** True when `root` is itself the top of a git work tree. */
export async function isRepoRoot(root: string): Promise<boolean> {
	try {
		return (
			realpathSync((await git(root, ["rev-parse", "--show-toplevel"])).trim()) ===
			realpathSync(root)
		);
	} catch {
		return false;
	}
}

export const gitInit = (root: string) => git(root, ["init", "-q"]);

const ACTIONS = ["add", "update", "archive"];
const STALE_LOCK_MS = 2 * 60_000;

/** Cross-process lock at `<root>/.git/pi-memory.lock` (created with O_EXCL, stale after 2 minutes). */
async function withLock<T>(root: string, fn: () => Promise<T>): Promise<T> {
	const path = join(root, ".git", "pi-memory.lock");
	const deadline = Date.now() + 30_000;
	for (;;) {
		try {
			closeSync(openSync(path, "wx"));
			break;
		} catch (e) {
			if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
			try {
				if (Date.now() - statSync(path).mtimeMs > STALE_LOCK_MS) {
					unlinkSync(path);
					continue;
				}
			} catch {}
			if (Date.now() > deadline) throw new Error("memory git lock is held by another process");
			await sleep(200);
		}
	}
	try {
		return await fn();
	} finally {
		rmSync(path, { force: true });
	}
}

export interface SyncOptions {
	notify: (message: string, level: "info" | "warning" | "error") => void;
	commitIntervalMinutes: number;
	push: boolean;
}

/**
 * Commits only the paths this session wrote, and pulls and pushes the vault. Any git failure
 * disables further git work for the session (notes keep working) and is reported once.
 */
export class GitSync {
	/** Vault-relative path to the label (`<project slug>` or `global`) of its commit message. */
	readonly dirty = new Map<string, string>();
	disabled?: string;
	#queue: Promise<unknown> = Promise.resolve();
	#timer?: NodeJS.Timeout;

	readonly root: string;
	readonly repo: boolean;
	readonly opts: SyncOptions;

	private constructor(root: string, repo: boolean, opts: SyncOptions) {
		this.root = root;
		this.repo = repo;
		this.opts = opts;
	}

	static async open(root: string, opts: SyncOptions): Promise<GitSync> {
		const repo = await isRepoRoot(root);
		if (!repo)
			opts.notify(
				`memory: ${root} is not a git repo; notes are not versioned (run /memory-init)`,
				"warning",
			);
		return new GitSync(root, repo, opts);
	}

	/** Paths that only exist because another path was archived; the archive is reported once. */
	readonly #moved = new Set<string>();

	/** Overview paths whose prose the summary worker rewrote; names a lone Overview commit. */
	readonly #summaries = new Set<string>();

	mark(rel: string, label: string, movedHere = false, summary = false) {
		if (summary) this.#summaries.add(rel);
		this.dirty.set(rel, label);
		if (movedHere) this.#moved.add(rel);
	}

	/** Pulls once and starts the commit timer. Resolves true when the pull brought in changes. */
	async start(): Promise<boolean> {
		const m = this.opts.commitIntervalMinutes;
		if (this.repo && m > 0) {
			this.#timer = setInterval(() => void this.commit(), m * 60_000);
			this.#timer.unref();
		}
		return this.pull();
	}

	/** Final commit, pull and push (when configured); stops the timer. */
	async finalize(): Promise<void> {
		clearInterval(this.#timer);
		await this.commit();
		await this.pull();
		if (this.opts.push) await this.push();
	}

	/** Commit, pull and push now. Resolves a one-line status. */
	async syncNow(): Promise<string> {
		if (!this.repo) return "Vault is not a git repo; nothing to sync.";
		if (this.disabled) return `Git sync is disabled for this session: ${this.disabled}`;
		await this.commit();
		await this.pull();
		await this.push();
		return this.disabled
			? `Sync stopped: ${this.disabled}`
			: "Synced (commit, pull --rebase, push).";
	}

	commit = () => this.#run(() => this.#commit());
	pull = async () => (await this.#run(() => this.#pull(), false)) ?? false;
	push = () => this.#run(() => this.#push(), undefined);

	/** Serialises git work in this process, then across processes with the lock file. */
	#run<T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
		const next = this.#queue.then(async () => {
			if (!this.repo || this.disabled) return fallback;
			try {
				return await withLock(this.root, fn);
			} catch (e) {
				this.#fail(e);
				return fallback;
			}
		});
		this.#queue = next;
		return next as Promise<T | undefined>;
	}

	#fail(e: unknown) {
		this.disabled = (e as Error).message.split("\n").find((l) => l.trim()) ?? "git failed";
		this.opts.notify(`memory: git sync disabled for this session: ${this.disabled}`, "error");
	}

	async #commit() {
		const byLabel = new Map<string, string[]>();
		for (const [path, label] of this.dirty)
			byLabel.set(label, [...(byLabel.get(label) ?? []), path]);
		for (const [label, paths] of byLabel) {
			const gone = paths.filter((p) => !existsSync(join(this.root, p)));
			const here = paths.filter((p) => !gone.includes(p));
			if (here.length) await git(this.root, ["add", "--", ...here]);
			if (gone.length)
				await git(this.root, ["rm", "--cached", "-q", "--ignore-unmatch", "--", ...gone]);
			const changed = (
				await git(this.root, [
					"diff",
					"--cached",
					"--name-status",
					"--no-renames",
					"-z",
					"--",
					...paths,
				])
			)
				.split("\0")
				.filter(Boolean);
			const files: { status: string; path: string }[] = [];
			for (let i = 0; i + 1 < changed.length; i += 2)
				files.push({ status: changed[i], path: changed[i + 1] });
			if (files.length) {
				const summary = this.#summarise(files);
				// `--only -- paths` commits just these paths even if the user has other files staged.
				await git(this.root, [
					"commit",
					"-q",
					"--only",
					"-m",
					`memory(${label}): ${summary.slice(0, 120)}`,
					"--",
					...files.map((f) => f.path),
				]);
			}
			for (const p of paths) {
				this.dirty.delete(p);
				this.#moved.delete(p);
				this.#summaries.delete(p);
			}
		}
	}

	/** `add A, B; update C; archive D`: one clause per action, long lists cut with "+N more". */
	#summarise(files: { status: string; path: string }[]): string {
		const action = (status: string) =>
			status === "A" ? "add" : status === "D" ? "archive" : "update";
		const named = files.filter((f) => !this.#moved.has(f.path));
		// The regenerated Overview index is noise next to real changes.
		const notes = named.filter((f) => basename(f.path, ".md") !== "Overview");
		const shown = notes.length ? notes : named;
		if (!notes.length && shown.every((f) => f.status === "M"))
			return shown.some((f) => this.#summaries.has(f.path)) ? "refresh summary" : "refresh index";
		const by = new Map<string, string[]>();
		for (const f of shown) {
			const list = by.get(action(f.status)) ?? [];
			list.push(basename(f.path, ".md"));
			by.set(action(f.status), list);
		}
		return [...by]
			.sort(([a], [b]) => ACTIONS.indexOf(a) - ACTIONS.indexOf(b))
			.map(([a, names]) => {
				const more = names.length > 3 ? `, +${names.length - 3} more` : "";
				return `${a} ${names.slice(0, 3).join(", ")}${more}`;
			})
			.join("; ");
	}

	#hasUpstream = () => ok(this.root, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);

	/** True when HEAD moved. A conflict aborts the rebase and disables sync. */
	async #pull(): Promise<boolean> {
		if (!(await this.#hasUpstream())) return false;
		const before = await git(this.root, ["rev-parse", "HEAD"]).catch(() => "");
		try {
			await git(this.root, ["pull", "--rebase", "--autostash"]);
		} catch (e) {
			await ok(this.root, ["rebase", "--abort"]);
			this.#fail(
				new Error(
					`pull --rebase failed, rebase aborted (resolve in the vault): ${(e as Error).message}`,
				),
			);
			return false;
		}
		return before !== (await git(this.root, ["rev-parse", "HEAD"]).catch(() => ""));
	}

	/** Never forces. */
	async #push() {
		if (await this.#hasUpstream()) await git(this.root, ["push", "-q"]);
	}
}
