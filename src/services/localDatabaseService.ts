import placesDataFull from "../../assets/data/places.json";
import placesDataDev from "../../assets/data/places-dev.json";
import {
  Place,
  PlaceCategory,
  StructuredPlaceRecord,
  UserLocation,
} from "@/types/place";
import { getDistanceMeters } from "@/services/locationService";
import { SEARCH_RADIUS_METERS } from "@/constants/categories";

let cachedRecords: StructuredPlaceRecord[] | null = null;

function recordToPlace(record: StructuredPlaceRecord, location?: UserLocation): Place {
  const place: Place = {
    id: record.id,
    name: record.name,
    category: record.category_id,
    subcategory: record.subcategory,
    source: "local",
    coordinates: {
      latitude: record.latitude,
      longitude: record.longitude,
    },
    address: record.full_address ?? undefined,
    street: record.street ?? undefined,
    city: record.city ?? undefined,
    region: record.region_name ?? undefined,
    phone: record.phone ?? undefined,
    email: record.email ?? undefined,
    website: record.website ?? undefined,
    openingHours: record.opening_hours ?? undefined,
    brand: record.brand ?? undefined,
    operator: record.operator ?? undefined,
    services: record.services,
  };

  if (location) {
    place.distanceMeters = getDistanceMeters(location, place.coordinates);
  }

  return place;
}

export async function loadLocalDatabase(): Promise<StructuredPlaceRecord[]> {
  if (cachedRecords) return cachedRecords;

  cachedRecords = (__DEV__ ? placesDataDev : placesDataFull) as StructuredPlaceRecord[];
  return cachedRecords;
}

export async function searchNearbyFromLocalDb(
  location: UserLocation,
  radiusMeters: number = SEARCH_RADIUS_METERS,
  category: PlaceCategory = "all",
  limit = 200
): Promise<Place[]> {
  const records = await loadLocalDatabase();

  const places = records
    .filter((record) => category === "all" || record.category_id === category)
    .map((record) => recordToPlace(record, location))
    .filter((place) => (place.distanceMeters ?? Infinity) <= radiusMeters)
    .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
    .slice(0, limit);

  return places;
}

export async function getLocalPlaceById(id: string): Promise<Place | null> {
  const records = await loadLocalDatabase();
  const record = records.find((item) => item.id === id);
  return record ? recordToPlace(record) : null;
}

export async function getLocalDatabaseStats() {
  const records = await loadLocalDatabase();
  const byCategory = new Map<string, number>();

  for (const record of records) {
    byCategory.set(record.category_id, (byCategory.get(record.category_id) ?? 0) + 1);
  }

  return {
    total: records.length,
    byCategory: Object.fromEntries(byCategory.entries()),
  };
}
