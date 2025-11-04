import fs, { writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { autoVersionMatcher } from "@secretize/coders";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";

registerHooks({
	load(url, context, nextLoad) {
		if (url.endsWith(".secretized")) {
			const __filename = fileURLToPath(import.meta.url);

			const urlObj = new URL(url);
			const rawPath = fileURLToPath(urlObj);
			const contents = fs.readFileSync(rawPath, "utf8");
			const versioned = autoVersionMatcher(contents);
			const secretized = versioned.rawToSecretized(contents);
			const shim = versioned.shimGenerator(
				secretized,
				`*/${path.basename(rawPath)}`,
			);

			writeFileSync(
				path.join(
					path.dirname(fileURLToPath(import.meta.url)),
					`/${path.basename(rawPath)}.shims.d.ts`,
				),
				shim,
				"utf8",
			);

			const publicKey = versioned.publicKeyExtractor(secretized);

			return {
				format: "module-typescript",
				shortCircuit: true,
				source: `
                    import { v1, nodeAutoAdapter } from "@secretize/coders";
                    export const createInstance = (adapter = nodeAutoAdapter(process.env.SAMPLE_NODE_APP_PRIVATE_KEY || 'test')) => v1.live(adapter(${JSON.stringify(publicKey)}))
                `,
			};
		}
		return nextLoad(url, context);
	},
});
