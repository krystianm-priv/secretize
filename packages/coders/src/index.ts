import { v1 } from "./versions/v1.ts";

export const autoVersionMatcher: (raw: string) => typeof v1 = (raw: string) => {
	for (const version of [v1]) {
		if (version.versionExtractor(raw)) return version;
	}
	throw new Error("No matching coder version found");
};

export { v1 };
export { default as nodeAutoAdapter } from "./adapters/node-auto.ts";
