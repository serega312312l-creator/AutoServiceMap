import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  getCurrentLocation,
  getDistanceMeters,
  requestLocationPermission,
} from "@/services/locationService";
import { UserLocation } from "@/types/place";
import { LOCATION_UPDATE_THRESHOLD_METERS } from "@/constants/categories";

interface UseUserLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastLocationRef = useRef<UserLocation | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const granted = await requestLocationPermission();
    if (!granted) {
      setPermissionDenied(true);
      setLoading(false);
      setError("Дозвіл на геолокацію не надано");
      return;
    }

    setPermissionDenied(false);

    try {
      const current = await getCurrentLocation();
      setLocation(current);
      lastLocationRef.current = current;
    } catch {
      setError("Не вдалося визначити ваше місцезнаходження");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const granted = await requestLocationPermission();
      if (!granted) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 100,
          timeInterval: 10000,
        },
        (position) => {
          const next: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
          };

          const last = lastLocationRef.current;
          if (
            last &&
            getDistanceMeters(last, next) < LOCATION_UPDATE_THRESHOLD_METERS
          ) {
            return;
          }

          lastLocationRef.current = next;
          setLocation(next);
        }
      );
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { location, loading, error, permissionDenied, refresh };
}
