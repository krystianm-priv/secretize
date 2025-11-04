import type { Coder } from "../coder.d.ts";

interface SecretizedV1 {
	name: string;
	publicKey: string;
	secrets: {
		name: string;
		value: string;
		description?: string;
		labels?: Record<string, string>;
	}[];
}

const schemaVerifiedSecretizedObject = (obj: unknown): SecretizedV1 => {
	if (typeof obj !== "object" || obj === null) {
		throw new Error("Invalid secretized object");
	}

	if (
		!("name" in obj) ||
		typeof obj.name !== "string" ||
		!/^[A-Z0-9_]+$/.test(obj.name)
	) {
		throw new Error(
			"Invalid 'name' field: must contain only uppercase letters, numbers, and underscores",
		);
	}

	if (!("publicKey" in obj) || typeof obj.publicKey !== "string") {
		throw new Error("Invalid or missing 'publicKey' field");
	}

	if (!("secrets" in obj) || !Array.isArray(obj.secrets)) {
		throw new Error("Invalid or missing 'secrets' field");
	}

	const validatedSecrets: SecretizedV1["secrets"] = obj.secrets.map(
		(entry, i) => {
			if (typeof entry !== "object" || entry === null) {
				throw new Error(`Invalid secret entry at index ${i}`);
			}

			const entryRecord = entry;
			const { name, value, description, labels } = entryRecord;

			if (typeof name !== "string") {
				throw new Error(
					`Invalid or missing 'name' in secret entry at index ${i}`,
				);
			}
			if (typeof value !== "string") {
				throw new Error(
					`Invalid or missing 'value' in secret entry at index ${i}`,
				);
			}

			if (description !== undefined && typeof description !== "string") {
				throw new Error(`Invalid 'description' in secret entry at index ${i}`);
			}

			if (labels !== undefined) {
				if (
					typeof labels !== "object" ||
					labels === null ||
					Array.isArray(labels)
				) {
					throw new Error(`Invalid 'labels' in secret entry at index ${i}`);
				}
				for (const [key, value] of Object.entries(labels)) {
					if (typeof value !== "string") {
						throw new Error(
							`Invalid label value for key '${key}' in secret entry at index ${i}`,
						);
					}
				}
			}

			return {
				name,
				value,
				...(description !== undefined ? { description } : {}),
				...(labels !== undefined ? { labels } : {}),
			};
		},
	);

	// Step 4: return fully typed object
	return {
		name: obj.name,
		publicKey: obj.publicKey,
		secrets: validatedSecrets,
	};
};

export const v1: Coder<SecretizedV1, "v1"> = {
	version: "v1",
	rawToSecretized: (raw) => {
		const [prefix, b64] = raw.split(";", 2);
		if (prefix !== "v/1") throw new Error("Invalid version prefix");
		return schemaVerifiedSecretizedObject(JSON.parse(atob(b64)));
	},
	secretizedToRaw: (secretized) =>
		`v/1;${btoa(JSON.stringify(schemaVerifiedSecretizedObject(secretized)))}`,
	versionExtractor(raw) {
		const [prefix] = raw.split(";", 1);
		return prefix === "v/1";
	},
	publicKeyExtractor(secretized) {
		return secretized.publicKey;
	},
	shimGenerator(secretized, absolutePath) {
		return `declare module "${absolutePath}" {
			${secretized.secrets
				.map(
					(entry) => `
				${entry.description ? `/** ${entry.description} */` : ""}
				export const ${entry.name}: string;
				`,
				)
				.join("\n")}
		}`;
	},
	live: ({ encrypt, decrypt }) => ({
		exposedToSecretized: (exposed) =>
			schemaVerifiedSecretizedObject({
				...exposed,
				secrets: exposed.secrets.map((entry) => ({
					...entry,
					value: encrypt(entry.value),
				})),
			}),
		secretizedToExposed: (secretized) =>
			schemaVerifiedSecretizedObject({
				...secretized,
				secrets: secretized.secrets.map((entry) => ({
					...entry,
					value: decrypt(entry.value),
				})),
			}),
	}),
};
