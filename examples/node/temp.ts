import { v1 } from "../../packages/coders/src/versions/v1.ts";

console.log(
	v1.secretizedToRaw({
		name: "NODE_EXAMPLE",
		publicKey: "examplePublicKey",
		secrets: [
			{
				name: "API_KEY",
				value: "1234567890abcdef",
				description: "API key for external service",
			},
		],
	}),
);
