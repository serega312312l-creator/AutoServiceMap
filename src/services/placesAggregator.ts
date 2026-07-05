import { fetchGooglePlaces } from "@/services/googlePlacesService";
import { searchNearbyFromLocalDb } from "@/services/localDatabaseService";
import { fetchOsmPlaces } from "@/services/osmService";
import { getDistanceMeters } from "@/services/locationService";
import { SERVICE_PRIORITY_CATEGORIES } from "@/constants/emergency";
import { Place, PlaceCategory, UserLocation } from "@/types/place";

export async function fetchNearbyPlaces(
  location: UserLocation,
  radiusMeters: number
): Promise<Place[]> {
  const [localPlaces, googlePlaces, osmPlaces] = await Promise.allSettled([
    searchNearbyFromLocalDb(location, radiusMeters),
    fetchGooglePlaces(location, radiusMeters),
    fetchOsmPlaces(location, radiusMeters),
  ]);

  const places: Place[] = [
    ...(localPlaces.status === "fulfilled" ? localPlaces.value : []),
    ...(googlePlaces.status === "fulfilled" ? googlePlaces.value : []),
    ...(osmPlaces.status === "fulfilled" ? osmPlaces.value : []),
  ];

  return enrichWithDistance(dedupePlaces(places), location);
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

/** Найближчий сервіс для екстреної ситуації (СТО, евакуатор, шини…) */
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
