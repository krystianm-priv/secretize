import { createContext, useContext, useState } from "react";

export type CipherState = {
	cipherText: string;
	publicKey: string;
};

type CipherContextValue = {
	cipher: CipherState;
	setCipher: (c: CipherState) => void;
	resetCipher: () => void;
};

const defaultCipher: CipherState = {
	cipherText: "",
	publicKey: "",
};

const CipherContext = createContext<CipherContextValue>({
	cipher: defaultCipher,
	setCipher: () => {},
	resetCipher: () => {},
});

export function CipherProvider({ children }: { children: React.ReactNode }) {
	const [cipher, setCipher] = useState<CipherState>(defaultCipher);

	const resetCipher = () => setCipher(defaultCipher);

	return (
		<CipherContext.Provider value={{ cipher, setCipher, resetCipher }}>
			{children}
		</CipherContext.Provider>
	);
}

export function useCipher() {
	return useContext(CipherContext);
}
