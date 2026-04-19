import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  Theme as NavigationThemeType,
} from "@react-navigation/native";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import {
  AppAccentColor,
  AppThemeMode,
  getAppColors,
} from "@/constants/theme";

type ThemeContextType = {
  themeMode: AppThemeMode;
  accentColor: AppAccentColor;
  colors: ReturnType<typeof getAppColors>;
  setThemeMode: (mode: AppThemeMode) => void;
  setAccentColor: (color: AppAccentColor) => void;
  toggleTheme: () => void;
  isThemeLoaded: boolean;
  navigationTheme: NavigationThemeType;
  statusBarStyle: "light" | "dark";
};

const THEME_MODE_STORAGE_KEY = "app_theme_mode";
const ACCENT_COLOR_STORAGE_KEY = "app_accent_color";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();

  const [themeMode, setThemeMode] = useState<AppThemeMode>(
    systemColorScheme === "dark" ? "dark" : "light"
  );
  const [accentColor, setAccentColor] = useState<AppAccentColor>("blue");
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) {
      return;
    }

    saveThemeSettings();
  }, [themeMode, accentColor, isThemeLoaded]);

  async function loadThemeSettings() {
    try {
      const [storedThemeMode, storedAccentColor] = await Promise.all([
        AsyncStorage.getItem(THEME_MODE_STORAGE_KEY),
        AsyncStorage.getItem(ACCENT_COLOR_STORAGE_KEY),
      ]);

      if (storedThemeMode === "light" || storedThemeMode === "dark") {
        setThemeMode(storedThemeMode);
      }

      if (
        storedAccentColor === "blue" ||
        storedAccentColor === "green" ||
        storedAccentColor === "orange" ||
        storedAccentColor === "purple"
      ) {
        setAccentColor(storedAccentColor);
      }
    } catch (error) {
      console.log("Failed to load theme settings:", error);
    } finally {
      setIsThemeLoaded(true);
    }
  }

  async function saveThemeSettings() {
    try {
      await Promise.all([
        AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode),
        AsyncStorage.setItem(ACCENT_COLOR_STORAGE_KEY, accentColor),
      ]);
    } catch (error) {
      console.log("Failed to save theme settings:", error);
    }
  }

  const colors = getAppColors(themeMode, accentColor);

  function toggleTheme() {
    setThemeMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  }

  const navigationTheme: NavigationThemeType =
    themeMode === "dark"
      ? {
          ...NavigationDarkTheme,
          colors: {
            ...NavigationDarkTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }
      : {
          ...NavigationLightTheme,
          colors: {
            ...NavigationLightTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        };

  const statusBarStyle: "light" | "dark" =
    themeMode === "dark" ? "light" : "dark";

  const value = useMemo(
    () => ({
      themeMode,
      accentColor,
      colors,
      setThemeMode,
      setAccentColor,
      toggleTheme,
      isThemeLoaded,
      navigationTheme,
      statusBarStyle,
    }),
    [
      themeMode,
      accentColor,
      colors,
      isThemeLoaded,
      navigationTheme,
      statusBarStyle,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }

  return context;
}