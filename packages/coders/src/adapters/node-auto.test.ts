import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

import node24 from "./node24.ts";
import node25 from "./node25.ts";

afterEach(() => mock.reset()); // clear all mocks between tests

describe("Node Auto Coder Adapter", () => {
	const cases = [
		[25, node25],
		[24, node24],
		[23, Error],
	];

	for (const [version, expected] of cases) {
		it(`should load the correct node v${version}`, async () => {
			mock.module("node:process", {
				namedExports: { version: `v${version}.0.0` },
			});

			if (expected === Error) {
				await assert.rejects(() => import(`./node-auto.ts?${version}`));
			} else {
				const { default: adapter } = await import(`./node-auto.ts?${version}`);
				assert.strictEqual(adapter, expected);
			}
		});
	}
});
