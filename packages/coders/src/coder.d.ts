export type Coder<T, version extends string> = {
	version: version;
	rawToSecretized(raw: string): T;
	secretizedToRaw(secretized: T): string;
	versionExtractor: (raw: string) => boolean;
	shimGenerator: (secretized: T, absolutePath: string) => string;
	publicKeyExtractor: (raw: T) => string;
	live: (args: {
		decrypt(cipher: string): string;
		encrypt(encoded: string): string;
	}) => {
		exposedToSecretized(exposed: T): T;
		secretizedToExposed(secretized: T): T;
	};
};
