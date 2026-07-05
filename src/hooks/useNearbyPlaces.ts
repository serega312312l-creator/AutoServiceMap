import { useCallback, useEffect, useState } from "react";
import {
  fetchNearbyPlaces,
  filterPlacesByDistance,
  findNearestService,
} from "@/services/placesAggregator";
import { Place, UserLocation } from "@/types/place";
import { MAX_AUTO_EXPAND_RADIUS_METERS } from "@/constants/categories";

interface UseNearbyPlacesOptions {
  radiusMeters: number;
  autoExpand?: boolean;
}

interface UseNearbyPlacesResult {
  places: Place[];
  nearestService: Place | null;
  effectiveRadiusMeters: number;
  expandedSearch: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNearbyPlaces(
  location: UserLocation | null,
  options: UseNearbyPlacesOptions
): UseNearbyPlacesResult {
  const { radiusMeters, autoExpand = true } = options;
  const [places, setPlaces] = useState<Place[]>([]);
  const [effectiveRadiusMeters, setEffectiveRadiusMeters] = useState(radiusMeters);
  const [expandedSearch, setExpandedSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);
    setExpandedSearch(false);

    try {
      let searchRadius = radiusMeters;
      let results = await fetchNearbyPlaces(location, searchRadius);
      let inRadius = filterPlacesByDistance(results, searchRadius);

      if (autoExpand && inRadius.length === 0 && searchRadius < MAX_AUTO_EXPAND_RADIUS_METERS) {
        const expandedRadii = [25_000, 50_000, 100_000].filter((r) => r > radiusMeters);
        for (const expanded of expandedRadii) {
          results = await fetchNearbyPlaces(location, expanded);
          inRadius = filterPlacesByDistance(results, expanded);
          searchRadius = expanded;
          if (inRadius.length > 0) {
            setExpandedSearch(true);
            break;
          }
        }
      }

      setEffectiveRadiusMeters(searchRadius);
      setPlaces(results);
    } catch {
      setError("Не вдалося завантажити місця. Перевірте інтернет — показуємо локальну базу.");
    } finally {
      setLoading(false);
    }
  }, [location, radiusMeters, autoExpand]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const nearestService = findNearestService(places);

  return {
    places,
    nearestService,
    effectiveRadiusMeters,
    expandedSearch,
    loading,
    error,
    refresh,
  };
}
