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
import { parsePhoneList } from "@/utils/placeFormat";
import {
  loadCachedDatabaseRecords,
  subscribeDatabaseRefresh,
} from "@/services/databaseUpdateService";

function buildAddressFromRecord(record: StructuredPlaceRecord): string | undefined {
  const parts: string[] = [];
  if (record.street) {
    parts.push(record.housenumber ? `${record.street}, ${record.housenumber}` : record.street);
  }
  if (record.city) parts.push(record.city);
  if (record.district) parts.push(record.district);
  if (record.region_name) parts.push(record.region_name);
  if (record.postal_code) parts.push(record.postal_code);
  if (parts.length > 0) return parts.join(", ");
  return record.full_address ?? undefined;
}

function recordToPlace(record: StructuredPlaceRecord, location?: UserLocation): Place {
  const phones = parsePhoneList(record.phone);
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
    address: buildAddressFromRecord(record),
    street: record.street ?? undefined,
    city: record.city ?? undefined,
    region: record.region_name ?? undefined,
    phone: phones[0],
    phones,
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

let cachedRecords: StructuredPlaceRecord[] | null = null;
let loadPromise: Promise<StructuredPlaceRecord[]> | null = null;

function getBundledRecords(): StructuredPlaceRecord[] {
  return (__DEV__ ? placesDataDev : placesDataFull) as StructuredPlaceRecord[];
}

function mergeRecords(
  bundled: StructuredPlaceRecord[],
  cached: StructuredPlaceRecord[]
): StructuredPlaceRecord[] {
  const map = new Map<string, StructuredPlaceRecord>();
  for (const r of bundled) map.set(r.id, r);
  for (const r of cached) map.set(r.id, r);
  return [...map.values()];
}

/** Скидає кеш — після автоматичного оновлення бази */
export function invalidateLocalDatabaseCache(): void {
  cachedRecords = null;
  loadPromise = null;
}

subscribeDatabaseRefresh(() => {
  invalidateLocalDatabaseCache();
});

export async function loadLocalDatabase(): Promise<StructuredPlaceRecord[]> {
  if (cachedRecords) return cachedRecords;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const bundled = getBundledRecords();
    const cached = await loadCachedDatabaseRecords();

    if (cached && cached.length > 0) {
      cachedRecords = mergeRecords(bundled, cached as StructuredPlaceRecord[]);
    } else {
      cachedRecords = bundled;
    }

    return cachedRecords;
  })();

  return loadPromise;
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
