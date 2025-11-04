// unknown eases typescript usage, at time hardly requiring it be defined
export default (privateKey: unknown) => (publicKey: string) => {
	if (
		!privateKey ||
		typeof privateKey !== "string" ||
		privateKey.length === 0
	) {
		throw new Error("Private key is required");
	}

	return {
		encrypt(plaintext: string) {
			return btoa(plaintext);
		},
		decrypt(ciphertext: string) {
			return atob(ciphertext);
		},
	};
};
