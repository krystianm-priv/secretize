export default (privateKey: string) => (publicKey: string) => {
	return {
		encrypt(plaintext: string) {
			return btoa(plaintext);
		},
		decrypt(ciphertext: string) {
			return atob(ciphertext);
		},
	};
};
