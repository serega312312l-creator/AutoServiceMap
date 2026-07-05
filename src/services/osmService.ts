import { Place, PlaceCategory, UserLocation } from "@/types/place";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
  return `
    [out:json][timeout:25];
    (
      node["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
      way["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
      node["shop"="car_parts"](around:${radiusMeters},${lat},${lon});
      way["shop"="car_parts"](around:${radiusMeters},${lat},${lon});
      node["shop"="tyres"](around:${radiusMeters},${lat},${lon});
      way["shop"="tyres"](around:${radiusMeters},${lat},${lon});
      node["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
      way["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
    );
    out center tags;
  `;
}

function mapOsmTagsToCategory(tags: Record<string, string>): PlaceCategory {
  if (tags.shop === "tyres") return "tires";
  if (tags.shop === "car_parts") return "autoshop";
  return "sto";
}

function getOsmCoordinates(element: OsmElement): { latitude: number; longitude: number } | null {
  if (element.lat != null && element.lon != null) {
    return { latitude: element.lat, longitude: element.lon };
  }
  if (element.center) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }
  return null;
}

interface OsmElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function fetchOsmPlaces(
  location: UserLocation,
  radiusMeters: number
): Promise<Place[]> {
  const query = buildOverpassQuery(location.latitude, location.longitude, radiusMeters);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error("Не вдалося завантажити дані OpenStreetMap");
  }

  const data = await response.json();
  const elements: OsmElement[] = data.elements ?? [];
  const places: Place[] = [];

  for (const element of elements) {
    const coords = getOsmCoordinates(element);
    const tags = element.tags ?? {};
    const name = tags.name ?? tags["name:uk"] ?? tags["name:en"];

    if (!coords || !name) continue;

    places.push({
      id: `osm-${element.type}-${element.id}`,
      name,
      category: mapOsmTagsToCategory(tags),
      source: "osm",
      coordinates: coords,
      address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
        .filter(Boolean)
        .join(", ") || undefined,
      phone: tags.phone ?? tags["contact:phone"],
      website: tags.website ?? tags["contact:website"],
      openingHours: tags.opening_hours,
    });
  }

  return places;
}
