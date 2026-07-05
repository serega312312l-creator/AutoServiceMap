import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppTheme, getTheme, ThemeMode } from "@/constants/theme";
import { getThemeMode, setThemeMode } from "@/services/themeService";

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const theme = getTheme(mode);

  useEffect(() => {
    getThemeMode().then(setModeState);
  }, []);

  const setMode = useCallback(async (m: ThemeMode) => {
    await setThemeMode(m);
    setModeState(m);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: getTheme("dark"),
      mode: "dark",
      toggleTheme: () => {},
      setMode: () => {},
    };
  }
  return ctx;
}
