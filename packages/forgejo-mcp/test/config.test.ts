import assert from "node:assert/strict";
import { test } from "node:test";
import { authHeader, buildServer, parseConfig } from "../src/config.ts";

test("no host means no config", () => {
	assert.equal(parseConfig(undefined), undefined);
	assert.equal(parseConfig({ token: "x" }), undefined);
});

test("host is normalised and defaults apply", () => {
	const c = parseConfig({ host: "https://git.example.com/mcp" });
	assert.equal(c?.host, "git.example.com");
	assert.equal(c?.token, "${FORGEJO_TOKEN}");
	assert.equal(c?.exposure, "deferred");
});

test("buildServer hides curated tools and lets overrides win", () => {
	const s = buildServer(
		parseConfig({ host: "h", toolExposure: { fork_repo: "deferred", bogus: "x" } })!,
	);
	assert.equal(s.url, "https://h/mcp");
	assert.equal(s.toolExposure["*team*"], "hidden");
	assert.equal(s.toolExposure.fork_repo, "deferred");
	assert.equal(s.toolExposure.bogus, undefined);
});

test("curate:false hides nothing", () => {
	assert.deepEqual(buildServer(parseConfig({ host: "h", curate: false })!).toolExposure, {});
});

test("authHeader wraps commands", () => {
	assert.equal(authHeader("abc"), "token abc");
	assert.equal(authHeader("!pass forgejo"), '!echo "token $(pass forgejo)"');
});
