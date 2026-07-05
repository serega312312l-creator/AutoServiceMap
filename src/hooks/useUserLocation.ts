import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  getCurrentLocation,
  getDistanceMeters,
  requestLocationPermission,
} from "@/services/locationService";
import { UserLocation } from "@/types/place";
import {
  LOCATION_UPDATE_THRESHOLD_METERS,
  NAVIGATION_UPDATE_THRESHOLD_METERS,
} from "@/constants/categories";

interface UseUserLocationOptions {
  /** Частіше оновлювати позицію під час маршруту (як у Google Maps) */
  navigationMode?: boolean;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  heading: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationResult {
  const { navigationMode = false } = options;
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastLocationRef = useRef<UserLocation | null>(null);

  const threshold = navigationMode
    ? NAVIGATION_UPDATE_THRESHOLD_METERS
    : LOCATION_UPDATE_THRESHOLD_METERS;

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
          accuracy: navigationMode ? Location.Accuracy.High : Location.Accuracy.Balanced,
          distanceInterval: navigationMode ? 10 : 50,
          timeInterval: navigationMode ? 3000 : 10000,
        },
        (position) => {
          const next: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? undefined,
          };

          if (position.coords.heading != null && position.coords.heading >= 0) {
            setHeading(position.coords.heading);
          }

          const last = lastLocationRef.current;
          if (last && getDistanceMeters(last, next) < threshold) {
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
  }, [navigationMode, threshold]);

  return { location, heading, loading, error, permissionDenied, refresh };
}
