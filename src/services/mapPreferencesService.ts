import { getJson, setJson } from "@/services/storageUtils";

const NIGHT_MAP_KEY = "avtogid:night_map";
const ALONG_ROUTE_KEY = "avtogid:along_route";

export async function isNightMapEnabled(): Promise<boolean> {
  return getJson<boolean>(NIGHT_MAP_KEY, true);
}

export async function setNightMapEnabled(value: boolean): Promise<void> {
  await setJson(NIGHT_MAP_KEY, value);
}

export async function isAlongRouteDefault(): Promise<boolean> {
  return getJson<boolean>(ALONG_ROUTE_KEY, false);
}

export async function setAlongRouteDefault(value: boolean): Promise<void> {
  await setJson(ALONG_ROUTE_KEY, value);
}
