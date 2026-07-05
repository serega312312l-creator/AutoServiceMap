import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  getCurrentLocation,
  getDistanceMeters,
  getLastKnownLocation,
  requestLocationPermission,
} from "@/services/locationService";
import { UserLocation } from "@/types/place";
import {
  LOCATION_UPDATE_THRESHOLD_METERS,
  NAVIGATION_UPDATE_THRESHOLD_METERS,
} from "@/constants/categories";

const FORCE_UPDATE_MS = 3000;
const RETRY_MS = 8000;

interface UseUserLocationOptions {
  navigationMode?: boolean;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  heading: number | null;
  loading: boolean;
  locating: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationResult {
  const { navigationMode = false } = options;
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastLocationRef = useRef<UserLocation | null>(null);
  const lastForceUpdateRef = useRef(0);

  const threshold = navigationMode
    ? NAVIGATION_UPDATE_THRESHOLD_METERS
    : LOCATION_UPDATE_THRESHOLD_METERS;

  const applyLocation = useCallback((next: UserLocation) => {
    lastLocationRef.current = next;
    setLocation(next);
    setLocating(false);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLocating(true);
    setError(null);

    const granted = await requestLocationPermission();
    if (!granted) {
      setPermissionDenied(true);
      setLoading(false);
      setLocating(false);
      setError("Дозвіл на геолокацію не надано");
      return;
    }

    setPermissionDenied(false);

    const cached = await getLastKnownLocation();
    if (cached) {
      applyLocation(cached);
    }

    try {
      const current = await getCurrentLocation();
      applyLocation(current);
    } catch {
      if (!cached) {
        setError("Увімкніть GPS — працює без інтернету");
      }
    } finally {
      setLoading(false);
    }
  }, [applyLocation]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let retryTimer: ReturnType<typeof setInterval> | null = null;

    const startWatching = async () => {
      const granted = await requestLocationPermission();
      if (!granted) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: navigationMode ? 5 : 10,
          timeInterval: navigationMode ? 2000 : 3000,
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

          const now = Date.now();
          const last = lastLocationRef.current;
          const moved = !last || getDistanceMeters(last, next) >= threshold;
          const forceDue = now - lastForceUpdateRef.current >= FORCE_UPDATE_MS;

          if (moved || forceDue) {
            lastForceUpdateRef.current = now;
            applyLocation(next);
          }
        }
      );

      retryTimer = setInterval(async () => {
        if (!lastLocationRef.current) {
          const cached = await getLastKnownLocation();
          if (cached) applyLocation(cached);
        }
        try {
          const fresh = await getCurrentLocation();
          applyLocation(fresh);
        } catch {
          // GPS still searching — keep last known
        }
      }, RETRY_MS);
    };

    startWatching();

    return () => {
      subscription?.remove();
      if (retryTimer) clearInterval(retryTimer);
    };
  }, [navigationMode, threshold, applyLocation]);

  return { location, heading, loading, locating, error, permissionDenied, refresh };
}
