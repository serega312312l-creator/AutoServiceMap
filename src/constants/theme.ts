export type ThemeMode = "dark" | "light";

export interface AppTheme {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  warning: string;
  accent: string;
}

export const DARK_THEME: AppTheme = {
  mode: "dark",
  background: "#0f172a",
  surface: "#1e293b",
  surfaceAlt: "#172554",
  border: "#334155",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  primary: "#2563eb",
  primaryText: "#ffffff",
  danger: "#dc2626",
  success: "#4ade80",
  warning: "#fbbf24",
  accent: "#60a5fa",
};

export const LIGHT_THEME: AppTheme = {
  mode: "light",
  background: "#f1f5f9",
  surface: "#ffffff",
  surfaceAlt: "#e2e8f0",
  border: "#cbd5e1",
  text: "#0f172a",
  textMuted: "#64748b",
  primary: "#2563eb",
  primaryText: "#ffffff",
  danger: "#dc2626",
  success: "#16a34a",
  warning: "#d97706",
  accent: "#2563eb",
};

export function getTheme(mode: ThemeMode): AppTheme {
  return mode === "light" ? LIGHT_THEME : DARK_THEME;
}
