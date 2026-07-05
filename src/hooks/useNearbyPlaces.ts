import { useCallback, useEffect, useState } from "react";
import {
  fetchNearbyPlaces,
  filterPlacesByDistance,
  findNearestService,
} from "@/services/placesAggregator";
import { subscribeDatabaseRefresh } from "@/services/databaseUpdateService";
import { Place, UserLocation } from "@/types/place";

interface UseNearbyPlacesOptions {
  radiusMeters: number;
}

interface UseNearbyPlacesResult {
  places: Place[];
  nearestService: Place | null;
  isOffline: boolean;
  localCount: number;
  onlineCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNearbyPlaces(
  location: UserLocation | null,
  options: UseNearbyPlacesOptions
): UseNearbyPlacesResult {
  const { radiusMeters } = options;
  const [places, setPlaces] = useState<Place[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchNearbyPlaces(location, radiusMeters);
      const inRadius = filterPlacesByDistance(result.places, radiusMeters);

      setPlaces(inRadius);
      setIsOffline(result.isOffline);
      setLocalCount(result.localCount);
      setOnlineCount(result.onlineCount);

      if (inRadius.length === 0) {
        setError("Поруч немає сервісів у радіусі. Спробуйте збільшити зону пошуку.");
      }
    } catch {
      setError("Помилка завантаження. Показуємо офлайн-базу.");
    } finally {
      setLoading(false);
    }
  }, [location, radiusMeters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return subscribeDatabaseRefresh(() => {
      refresh();
    });
  }, [refresh]);

  const nearestService = findNearestService(places);

  return {
    places,
    nearestService,
    isOffline,
    localCount,
    onlineCount,
    loading,
    error,
    refresh,
  };
}
