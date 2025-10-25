import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { ThemeProvider, useTheme } from "./src/Theme/ThemeContext";
import AppNavigation from "./src/Navigation/AppNavigation";

function ThemedApp() {
	const { paperTheme } = useTheme();

	return (
		<PaperProvider theme={paperTheme}>
			<AppNavigation />
		</PaperProvider>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<ThemedApp />
		</ThemeProvider>
	);
}
