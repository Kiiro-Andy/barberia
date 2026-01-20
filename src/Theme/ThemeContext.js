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
    gold: "#C0A060", // dorado elegante
    black: "#141414", // negro real
    darkGray: "#1E1E1E", // superficies dark
    lightGray: "#F2F2F2", // fondo light
    gray: "#8E8E8E", // subtext
    white: "#FFFFFF",

	wineRed: "#7A1F2B",
 	navyBlue: "#0E1A2B",
	infoDark: "#4DA3FF"
  };

  // Combinar temas de Paper y Navigation
  const CombinedLightTheme = {
    ...PaperDefaultTheme,
    ...NavigationDefaultTheme,
    colors: {
      ...PaperDefaultTheme.colors,
      ...NavigationDefaultTheme.colors,

      background: barberColors.lightGray,
      surface: barberColors.white,
      card: "#FAFAFA",

      text: "#1A1A1A",
      subtext: "#6B6B6B",

      primary: barberColors.black,
      accent: barberColors.gold,

	secondary: barberColors.navyBlue,
    error: barberColors.wineRed,

      border: "#E0E0E0",
      placeholder: "#9A9A9A",
    },
  };

  const CombinedDarkTheme = {
    ...PaperDarkTheme,
    ...NavigationDarkTheme,
    colors: {
      ...PaperDarkTheme.colors,
      ...NavigationDarkTheme.colors,

      background: barberColors.black,
      surface: barberColors.darkGray,
      card: "#1C1C1C",

      text: barberColors.white,
      subtext: "#B3B3B3",

      primary: barberColors.white,
      accent: barberColors.gold,

	  secondary: barberColors.gold,
      info: barberColors.infoDark,
	  error: barberColors.wineRed,

      border: "#2C2C2C",
      placeholder: "#7A7A7A",
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
