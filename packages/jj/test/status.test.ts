import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { jjUsable } from "../src/detect.ts";
import { readStatus } from "../src/status.ts";

test("status shows the change id and bookmark of @ without adding an operation", {
	skip: !jjUsable(),
}, async () => {
	const dir = mkdtempSync(join(tmpdir(), "jj-status-"));
	const jj = (...a: string[]) =>
		execFileSync("jj", a, { cwd: dir, encoding: "utf8", stdio: "pipe" });
	jj("git", "init", ".");
	jj("bookmark", "create", "feat", "-r", "@");
	const ops = () => jj("--ignore-working-copy", "op", "log", "--no-graph", "-T", "id.short()\n");
	const before = ops();
	assert.match((await readStatus(dir)) ?? "", /^[k-z]{8} feat$/);
	assert.equal(ops(), before);
});
