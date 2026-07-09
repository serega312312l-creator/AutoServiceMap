import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/types/place";
import { PlaceTag, SavedPlaceEntry } from "@/types/user";
import { pushCloudSync } from "@/services/syncService";

const FAVORITES_KEY = "avtogid:favorites_v2";
const RECENT_KEY = "avtogid:recent";
const MAX_RECENT = 10;

function migrateLegacyFavorites(raw: Place[]): SavedPlaceEntry[] {
  return raw.map((place) => ({
    place,
    savedAt: new Date().toISOString(),
  }));
}

export async function getFavorites(): Promise<SavedPlaceEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw) as SavedPlaceEntry[];

    const legacy = await AsyncStorage.getItem("avtogid:favorites");
    if (legacy) {
      const migrated = migrateLegacyFavorites(JSON.parse(legacy) as Place[]);
      await setFavorites(migrated);
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

export async function setFavorites(entries: SavedPlaceEntry[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(entries));
}

export async function getFavoritePlaces(): Promise<Place[]> {
  return (await getFavorites()).map((e) => e.place);
}

export async function getRecent(): Promise<Place[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(place: Place, tag?: PlaceTag): Promise<boolean> {
  const favorites = await getFavorites();
  const index = favorites.findIndex((e) => e.place.id === place.id);
  let isFavorite: boolean;

  if (index >= 0) {
    favorites.splice(index, 1);
    isFavorite = false;
  } else {
    favorites.unshift({
      place,
      tag,
      savedAt: new Date().toISOString(),
    });
    isFavorite = true;
  }

  await setFavorites(favorites);
  pushCloudSync().catch(() => {});
  return isFavorite;
}

export async function updateFavoriteTag(placeId: string, tag: PlaceTag, note?: string): Promise<void> {
  const favorites = await getFavorites();
  const entry = favorites.find((e) => e.place.id === placeId);
  if (!entry) return;
  entry.tag = tag;
  if (note !== undefined) entry.note = note;
  await setFavorites(favorites);
  pushCloudSync().catch(() => {});
}

export async function isFavorite(placeId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((e) => e.place.id === placeId);
}

export async function addToRecent(place: Place): Promise<void> {
  const recent = await getRecent();
  const filtered = recent.filter((p) => p.id !== place.id);
  filtered.unshift(place);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
}

export async function removeFavorite(placeId: string): Promise<void> {
  const favorites = await getFavorites();
  await setFavorites(favorites.filter((e) => e.place.id !== placeId));
  pushCloudSync().catch(() => {});
}
