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

	const barberColors = {
		primary: "#1C1C1C", // negro profundo
		accent: "#C0A060", // dorado clásico
		secondary: "#7A1F1F", // vino/rojo oscuro
		blueBarber: "#1E3A5F", // azul acero
		cream: "#ecececff",
	};

	// Combinar temas de Paper y Navigation
	const CombinedLightTheme = {
		...PaperDefaultTheme,
		...NavigationDefaultTheme,
		colors: {
			...PaperDefaultTheme.colors,
			...NavigationDefaultTheme.colors,
			background: barberColors.cream,
			backgroundHeader: "#edebefff",
			surface: "#fff",
			text: "#1B1B1B",
			subtext: "#555",
			primary: barberColors.primary,
			accent: barberColors.accent,
			secondary: barberColors.secondary,
			bluecard: barberColors.blueBarber,
			card: "#FAFAFA",
			border: "#DDD",
			placeholder: "#999",
			button1: barberColors.blueBarber,
			button2: barberColors.secondary,
		},
	};

	const CombinedDarkTheme = {
		...PaperDarkTheme,
		...NavigationDarkTheme,
		colors: {
			...PaperDarkTheme.colors,
			...NavigationDarkTheme.colors,
			background: "#1e1d21ff",
			backgroundHeader: "#161616",
			surface: "#161616",
			text: "#FFFFFF",
			subtext: "#BEBEBE",
			primary: barberColors.primary,
			accent: barberColors.accent,
			secondary: barberColors.blueBarber,
			card: "#1E1E1E",
			border: "#2A2A2A",
			placeholder: "#777",
			button1: barberColors.blueBarber,
			button2: barberColors.secondary,
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
