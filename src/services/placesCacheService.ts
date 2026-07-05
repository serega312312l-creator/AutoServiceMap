import * as FileSystem from "expo-file-system/legacy";
import { getJson, setJson } from "@/services/storageUtils";
import { Place, UserLocation } from "@/types/place";

const CACHE_DIR = `${FileSystem.documentDirectory}avtogid/places-cache/`;
const INDEX_KEY = "avtogid:places_cache_index";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheIndexEntry {
  key: string;
  file: string;
  expiresAt: string;
  count: number;
}

function cacheKey(location: UserLocation, radiusMeters: number, source: "osm" | "google"): string {
  const lat = location.latitude.toFixed(2);
  const lng = location.longitude.toFixed(2);
  const r = Math.round(radiusMeters / 1000);
  return `${source}_${lat}_${lng}_${r}km`;
}

async function ensureDir(): Promise<void> {
  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
}

export async function getCachedOnlinePlaces(
  location: UserLocation,
  radiusMeters: number,
  source: "osm" | "google"
): Promise<Place[] | null> {
  const key = cacheKey(location, radiusMeters, source);
  const index = await getJson<CacheIndexEntry[]>(INDEX_KEY, []);
  const entry = index.find((e) => e.key === key);
  if (!entry) return null;
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    await FileSystem.deleteAsync(entry.file, { idempotent: true });
    await setJson(
      INDEX_KEY,
      index.filter((e) => e.key !== key)
    );
    return null;
  }

  try {
    const raw = await FileSystem.readAsStringAsync(entry.file);
    return JSON.parse(raw) as Place[];
  } catch {
    return null;
  }
}

export async function setCachedOnlinePlaces(
  location: UserLocation,
  radiusMeters: number,
  source: "osm" | "google",
  places: Place[],
  ttlMs = DEFAULT_TTL_MS
): Promise<void> {
  await ensureDir();
  const key = cacheKey(location, radiusMeters, source);
  const file = `${CACHE_DIR}${key}.json`;
  await FileSystem.writeAsStringAsync(file, JSON.stringify(places));

  const index = (await getJson<CacheIndexEntry[]>(INDEX_KEY, [])).filter((e) => e.key !== key);
  index.push({
    key,
    file,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    count: places.length,
  });
  await setJson(INDEX_KEY, index);
}

export async function purgeExpiredPlaceCache(): Promise<number> {
  const index = await getJson<CacheIndexEntry[]>(INDEX_KEY, []);
  const now = Date.now();
  let removed = 0;
  const kept: CacheIndexEntry[] = [];

  for (const entry of index) {
    if (new Date(entry.expiresAt).getTime() < now) {
      await FileSystem.deleteAsync(entry.file, { idempotent: true });
      removed++;
    } else {
      kept.push(entry);
    }
  }
  await setJson(INDEX_KEY, kept);
  return removed;
}

export async function getPlaceCacheStats(): Promise<{ entries: number; totalPlaces: number }> {
  const index = await getJson<CacheIndexEntry[]>(INDEX_KEY, []);
  const valid = index.filter((e) => new Date(e.expiresAt).getTime() >= Date.now());
  return {
    entries: valid.length,
    totalPlaces: valid.reduce((s, e) => s + e.count, 0),
  };
}
