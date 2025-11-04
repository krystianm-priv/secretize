import { createContext, useContext, useState } from "react";
import { Edit } from "@/screens/Edit";
import Home from "@/screens/Home";
import KeyGenerator from "@/screens/KeyGenerator";
import { Button } from "./ui/button";

export const screens = {
	Home,
	KeyGenerator,
	Edit,
} as const;

export type AvailableScreens = keyof typeof screens;

export const defaultScreen: AvailableScreens = "Home";

export const ScreenContext = createContext<{
	screen: AvailableScreens;
	setScreen: (s: AvailableScreens) => void;
}>({
	screen: defaultScreen,
	setScreen: () => {},
});

export function ScreenProvider() {
	const [screen, setScreen] = useState<AvailableScreens>(defaultScreen);

	const Screen = screens[screen];

	return (
		<>
			{screen !== defaultScreen && (
				<div className="absolute top-4 left-4">
					<Button onClick={() => setScreen(defaultScreen)}>Back</Button>
				</div>
			)}
			<ScreenContext.Provider value={{ screen, setScreen }}>
				<Screen />
			</ScreenContext.Provider>
		</>
	);
}

export function useScreen() {
	return useContext(ScreenContext);
}
