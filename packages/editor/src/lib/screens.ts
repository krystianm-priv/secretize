import Home from "@/screens/Home";
import KeyGenerator from "@/screens/KeyGenerator";

export default {
	Home,
	KeyGenerator,
} as const;

export type AvailableScreens = keyof typeof import("./screens")["default"];
