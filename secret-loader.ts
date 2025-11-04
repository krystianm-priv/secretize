import fs from "node:fs";
import { registerHooks } from "node:module";

registerHooks({
	load(url, context, nextLoad) {
		if (url.endsWith(".secretized")) {
			const encoded = fs.readFileSync(new URL(url), "utf8");
			const decoded = Buffer.from(encoded, "base64").toString("utf8");

			return {
				format: "module-typescript",
				shortCircuit: true,
				source: decoded,
			};
		}
		return nextLoad(url, context);
	},
});

const secrets = await import("./env.secretized");

export default { ...secrets };
