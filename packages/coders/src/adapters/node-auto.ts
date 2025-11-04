import { version } from "node:process";
import node24 from "./node24.ts";
import node25 from "./node25.ts";

const available = {
	24: node24,
	25: node25,
};

const denotedVersion = +version.split(".")[0].slice(1);

if (!(denotedVersion in available)) {
	throw new Error(
		`No coder adapter available for Node.js version ${denotedVersion}`,
	);
}

export default available[denotedVersion as keyof typeof available];
