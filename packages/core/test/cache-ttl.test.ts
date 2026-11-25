import assert from "node:assert/strict";
import { test } from "node:test";
import { CACHE_TTL_ENTRY_TYPE, readCacheTtl } from "../src/cache-ttl/index.ts";

test("readCacheTtl takes the latest entry on the branch", () => {
	const e = (ttl: string) => ({ type: "custom", customType: CACHE_TTL_ENTRY_TYPE, data: { ttl } });
	assert.equal(readCacheTtl([]), undefined);
	assert.equal(readCacheTtl([e("1h"), { type: "message" }]), "1h");
	assert.equal(readCacheTtl([e("1h"), e("5m")]), "5m");
});
