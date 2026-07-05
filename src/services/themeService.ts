import { ThemeMode } from "@/constants/theme";
import { getJson, setJson } from "@/services/storageUtils";

const THEME_KEY = "avtogid:theme";

export async function getThemeMode(): Promise<ThemeMode> {
  return getJson<ThemeMode>(THEME_KEY, "dark");
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  await setJson(THEME_KEY, mode);
}
