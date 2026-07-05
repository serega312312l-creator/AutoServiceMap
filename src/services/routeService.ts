import { Coordinates } from "@/types/place";

export interface RouteInfo {
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
}

interface OsrmResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates: [number, number][];
    };
  }>;
}

/** Маршрут по дорогах через OSRM (безкоштовно, без додаткового API ключа) */
export async function fetchDrivingRoute(
  from: Coordinates,
  to: Coordinates
): Promise<RouteInfo | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as OsrmResponse;
  const route = data.routes?.[0];
  if (!route?.geometry?.coordinates?.length) return null;

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

export function formatRouteDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} хв`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} год ${rest} хв` : `${hours} год`;
}
