import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	DefaultTheme as PaperDefaultTheme,
	MD3DarkTheme as PaperDarkTheme,
} from "react-native-paper";
import {
	DefaultTheme as NavigationDefaultTheme,
	DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";

const STORAGE_KEY = "APP_THEME"; // 'dark' | 'light' | 'system'
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
	const sys = useColorScheme(); // 'light' | 'dark' | null
	const [themeName, setThemeName] = useState("system");
	const [ready, setReady] = useState(false);

	// Cargar preferencia guardada
	useEffect(() => {
		(async () => {
			try {
				const saved = await AsyncStorage.getItem(STORAGE_KEY);
				setThemeName(saved || "system");
			} catch (e) {
				console.warn("No se pudo leer tema guardado:", e);
			} finally {
				setReady(true);
			}
		})();
	}, []);

	const effective = themeName === "system" ? sys : themeName;
	const isDark = effective === "dark";

	// Combinar temas de Paper y Navigation
	const CombinedLightTheme = {
		...PaperDefaultTheme,
		...NavigationDefaultTheme,
		colors: {
			...PaperDefaultTheme.colors,
			...NavigationDefaultTheme.colors,
			background: "#ecececff",
			surface: "#F5F5F5",
			text: "#111111",
			subtext: "#666666",
			primary: "#0A192F",
			accent: "#C0A060",
			card: "#FFFFFF",
			placeholder: "#999999",
		},
	};

	const CombinedDarkTheme = {
		...PaperDarkTheme,
		...NavigationDarkTheme,
		colors: {
			...PaperDarkTheme.colors,
			...NavigationDarkTheme.colors,
			background: "#0b0b0bff",
			surface: "#1C1C1C",
			text: "#FFFFFF",
			subtext: "#BBBBBB",
			primary: "#0A192F",
			accent: "#C0A060",
			card: "#161616",
			placeholder: "#777777",
		},
	};

	const paperTheme = isDark ? CombinedDarkTheme : CombinedLightTheme;

	const toggleTheme = async () => {
		const next = themeName === "dark" ? "light" : "dark";
		setThemeName(next);
		await AsyncStorage.setItem(STORAGE_KEY, next);
	};

	const setExplicitTheme = async (name) => {
		setThemeName(name);
		await AsyncStorage.setItem(STORAGE_KEY, name);
	};

	if (!ready) return null; // Evita parpadeo mientras carga AsyncStorage

	return (
		<ThemeContext.Provider
			value={{
				theme: paperTheme,
				paperTheme,
				isDark,
				themeName,
				toggleTheme,
				setExplicitTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
