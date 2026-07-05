import { useCallback, useEffect, useState } from "react";
import { fetchNearbyPlaces } from "@/services/placesAggregator";
import { Place, UserLocation } from "@/types/place";

interface UseNearbyPlacesResult {
  places: Place[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNearbyPlaces(location: UserLocation | null): UseNearbyPlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const results = await fetchNearbyPlaces(location);
      setPlaces(results);
    } catch {
      setError("Не вдалося завантажити місця поруч");
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { places, loading, error, refresh };
}
