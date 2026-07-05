import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/types/place";

const FAVORITES_KEY = "avtogid:favorites";
const RECENT_KEY = "avtogid:recent";
const MAX_RECENT = 10;

export async function getFavorites(): Promise<Place[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

export async function getRecent(): Promise<Place[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(place: Place): Promise<boolean> {
  const favorites = await getFavorites();
  const index = favorites.findIndex((p) => p.id === place.id);
  let isFavorite: boolean;

  if (index >= 0) {
    favorites.splice(index, 1);
    isFavorite = false;
  } else {
    favorites.unshift(place);
    isFavorite = true;
  }

  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return isFavorite;
}

export async function isFavorite(placeId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((p) => p.id === placeId);
}

export async function addToRecent(place: Place): Promise<void> {
  const recent = await getRecent();
  const filtered = recent.filter((p) => p.id !== place.id);
  filtered.unshift(place);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
}

export async function removeFavorite(placeId: string): Promise<void> {
  const favorites = await getFavorites();
  await AsyncStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites.filter((p) => p.id !== placeId))
  );
}
