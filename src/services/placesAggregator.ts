import { fetchGooglePlaces } from "@/services/googlePlacesService";
import { searchNearbyFromLocalDb } from "@/services/localDatabaseService";
import { isDeviceOnline } from "@/services/networkService";
import { fetchOsmPlaces } from "@/services/osmService";
import { getDistanceMeters } from "@/services/locationService";
import { SERVICE_PRIORITY_CATEGORIES } from "@/constants/emergency";
import { Place, PlaceCategory, UserLocation } from "@/types/place";

export interface FetchPlacesResult {
  places: Place[];
  isOffline: boolean;
  localCount: number;
  onlineCount: number;
}

const ONLINE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

/** Офлайн-перший пошук: локальна база завжди, онлайн — якщо є мережа */
export async function fetchNearbyPlaces(
  location: UserLocation,
  radiusMeters: number
): Promise<FetchPlacesResult> {
  const localPlaces = await searchNearbyFromLocalDb(location, radiusMeters, "all", 1000);

  const online = await isDeviceOnline();
  if (!online) {
    return {
      places: localPlaces,
      isOffline: true,
      localCount: localPlaces.length,
      onlineCount: 0,
    };
  }

  const [googleResult, osmResult] = await Promise.allSettled([
    withTimeout(fetchGooglePlaces(location, radiusMeters), ONLINE_TIMEOUT_MS),
    withTimeout(fetchOsmPlaces(location, radiusMeters), ONLINE_TIMEOUT_MS),
  ]);

  const onlinePlaces: Place[] = [
    ...(googleResult.status === "fulfilled" ? googleResult.value : []),
    ...(osmResult.status === "fulfilled" ? osmResult.value : []),
  ];

  const merged = enrichWithDistance(
    dedupePlaces([...localPlaces, ...onlinePlaces]),
    location
  );

  const onlineOnly = merged.filter((p) => p.source !== "local").length;

  return {
    places: merged,
    isOffline: onlinePlaces.length === 0 && localPlaces.length > 0,
    localCount: localPlaces.length,
    onlineCount: onlineOnly,
  };
}

export function findNearestByCategory(
  places: Place[],
  category: PlaceCategory
): Place | null {
  const filtered = places.filter((p) => p.category === category);
  if (filtered.length === 0) return null;
  return [...filtered].sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))[0];
}

export function filterPlaces(places: Place[], category: PlaceCategory): Place[] {
  if (category === "all") return places;
  return places.filter((place) => place.category === category);
}

export function filterPlacesByDistance(places: Place[], radiusMeters: number): Place[] {
  return places.filter((place) => (place.distanceMeters ?? Infinity) <= radiusMeters);
}

export function filterPlacesByQuery(places: Place[], query: string): Place[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return places;
  return places.filter(
    (place) =>
      place.name.toLowerCase().includes(normalized) ||
      place.address?.toLowerCase().includes(normalized) ||
      place.city?.toLowerCase().includes(normalized)
  );
}

export function findNearestService(places: Place[]): Place | null {
  if (places.length === 0) return null;

  const priority = places.filter(
    (place) =>
      place.category !== "all" &&
      SERVICE_PRIORITY_CATEGORIES.includes(
        place.category as (typeof SERVICE_PRIORITY_CATEGORIES)[number]
      )
  );

  const pool = priority.length > 0 ? priority : places;
  return [...pool].sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))[0];
}

function enrichWithDistance(places: Place[], location: UserLocation): Place[] {
  return places
    .map((place) => ({
      ...place,
      distanceMeters: getDistanceMeters(location, place.coordinates),
    }))
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
}

function dedupePlaces(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}-${place.coordinates.latitude.toFixed(3)}-${place.coordinates.longitude.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
