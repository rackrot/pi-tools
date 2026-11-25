import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Embeds the files as tagged blocks. Unreadable or oversized files are reported, never thrown. */
export function embedFiles(paths: string[] | undefined, cwd: string, maxBytes: number): string {
	if (!paths?.length) return "";
	return paths
		.map((p) => {
			try {
				const buf = readFileSync(resolve(cwd, p));
				const truncated = buf.length > maxBytes;
				const text = buf.subarray(0, maxBytes).toString("utf8");
				return `<file path="${p}"${truncated ? ` truncated="${maxBytes} of ${buf.length} bytes"` : ""}>\n${text}\n</file>`;
			} catch (e) {
				return `<file path="${p}" error="${(e as Error).message}" />`;
			}
		})
		.join("\n\n");
}
