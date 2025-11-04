type Modes = readonly string[];

export type SecretizedFile<ModeList extends Modes> = {
	publicKey: string;
	modes: ModeList;
	secrets: Secrets<ModeList>;
};

export type Secrets<SecretModes extends Modes> = SingleSecret<SecretModes>[];

export type SingleSecret<SingleSecretModes extends Modes> = {
	name: string;
	values: {
		[Mode in SingleSecretModes[number]]: string;
	};
	labels: Record<string, string>;
};
