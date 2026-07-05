import * as FileSystem from "expo-file-system/legacy";
import { Coordinates, Place } from "@/types/place";
import { RouteInfo } from "@/services/routeService";
import { getJson, setJson } from "@/services/storageUtils";

const ROUTE_FILE = `${FileSystem.documentDirectory}avtogid/last-route.json`;
const META_KEY = "avtogid:last_route_meta";

export interface CachedRoute {
  place: Place;
  route: RouteInfo;
  savedAt: string;
}

export async function saveRouteCache(place: Place, route: RouteInfo): Promise<void> {
  const data: CachedRoute = {
    place,
    route,
    savedAt: new Date().toISOString(),
  };
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}avtogid/`, {
    intermediates: true,
  });
  await FileSystem.writeAsStringAsync(ROUTE_FILE, JSON.stringify(data));
  await setJson(META_KEY, { savedAt: data.savedAt, placeName: place.name });
}

export async function loadRouteCache(): Promise<CachedRoute | null> {
  try {
    const info = await FileSystem.getInfoAsync(ROUTE_FILE);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(ROUTE_FILE);
    return JSON.parse(raw) as CachedRoute;
  } catch {
    return null;
  }
}

export async function getRouteCacheMeta(): Promise<{ savedAt: string; placeName: string } | null> {
  return getJson(META_KEY, null);
}

export async function clearRouteCache(): Promise<void> {
  try {
    await FileSystem.deleteAsync(ROUTE_FILE, { idempotent: true });
  } catch {
    // ignore
  }
}

export function getCachedRouteCoordinates(cache: CachedRoute): Coordinates[] {
  return cache.route.coordinates;
}
