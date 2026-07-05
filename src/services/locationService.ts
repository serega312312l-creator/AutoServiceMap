import * as Location from "expo-location";
import { UserLocation } from "@/types/place";

const GPS_TIMEOUT_MS = 12_000;

function positionToUserLocation(position: Location.LocationObject): UserLocation {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? undefined,
  };
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

/** Швидкий старт з кешу GPS (працює без інтернету) */
export async function getLastKnownLocation(): Promise<UserLocation | null> {
  try {
    const last = await Location.getLastKnownPositionAsync();
    return last ? positionToUserLocation(last) : null;
  } catch {
    return null;
  }
}

/** Поточна позиція: спочатку кеш, потім GPS з таймаутом — офлайн-сумісно */
export async function getCurrentLocation(): Promise<UserLocation> {
  const lastKnown = await getLastKnownLocation();

  const gpsPromise = Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), GPS_TIMEOUT_MS)
  );

  const position = await Promise.race([gpsPromise, timeoutPromise]);

  if (position) {
    return positionToUserLocation(position);
  }

  if (lastKnown) {
    return lastKnown;
  }

  throw new Error("GPS недоступний");
}

export function getDistanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const earthRadius = 6371000;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLon = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function formatDistance(meters?: number): string {
  if (meters == null) return "—";
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1)} км`;
}
