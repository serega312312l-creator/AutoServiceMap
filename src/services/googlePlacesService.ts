import Constants from "expo-constants";
import { Place, PlaceCategory, UserLocation } from "@/types/place";

const GOOGLE_TYPES: Record<"sto" | "autoshop" | "tires", string[]> = {
  sto: ["car_repair"],
  autoshop: ["car_dealer", "store"],
  tires: ["car_repair"],
};

function getApiKey(): string | undefined {
  return Constants.expoConfig?.extra?.googlePlacesApiKey as string | undefined;
}

function mapGoogleTypeToCategory(types: string[]): PlaceCategory {
  if (types.includes("car_repair")) return "sto";
  if (types.includes("car_dealer")) return "autoshop";
  if (types.some((t) => t.includes("store"))) return "autoshop";
  return "sto";
}

export async function fetchGooglePlaces(
  location: UserLocation,
  radiusMeters: number
): Promise<Place[]> {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.startsWith("YOUR_")) {
    return [];
  }

  const categories = ["sto", "autoshop", "tires"] as const;
  const results: Place[] = [];

  for (const category of categories) {
    const types = GOOGLE_TYPES[category];
    for (const type of types) {
      const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.nationalPhoneNumber,places.websiteUri,places.rating,places.currentOpeningHours,places.businessStatus",
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              radius: radiusMeters,
            },
          },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const places = data.places ?? [];

      for (const place of places) {
        results.push({
          id: `google-${place.id}`,
          name: place.displayName?.text ?? "Без назви",
          category: mapGoogleTypeToCategory(place.types ?? []),
          source: "google",
          coordinates: {
            latitude: place.location.latitude,
            longitude: place.location.longitude,
          },
          address: place.formattedAddress,
          phone: place.nationalPhoneNumber,
          website: place.websiteUri,
          rating: place.rating,
          isOpen: place.currentOpeningHours?.openNow,
          openingHours: place.currentOpeningHours?.weekdayDescriptions?.join("\n"),
        });
      }
    }
  }

  return dedupePlaces(results);
}

function dedupePlaces(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.name}-${place.coordinates.latitude.toFixed(4)}-${place.coordinates.longitude.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
