import { SEARCH_RADIUS_METERS } from "@/constants/categories";
import { fetchGooglePlaces } from "@/services/googlePlacesService";
import { searchNearbyFromLocalDb } from "@/services/localDatabaseService";
import { fetchOsmPlaces } from "@/services/osmService";
import { getDistanceMeters } from "@/services/locationService";
import { Place, PlaceCategory, UserLocation } from "@/types/place";

export async function fetchNearbyPlaces(location: UserLocation): Promise<Place[]> {
  const [localPlaces, googlePlaces, osmPlaces] = await Promise.allSettled([
    searchNearbyFromLocalDb(location, SEARCH_RADIUS_METERS),
    fetchGooglePlaces(location, SEARCH_RADIUS_METERS),
    fetchOsmPlaces(location, SEARCH_RADIUS_METERS),
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
