import { Coordinates } from "@/types/place";

export interface RouteInfo {
  coordinates: Coordinates[];
  distanceMeters: number;
  durationSeconds: number;
  label?: string;
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

function parseOsrmRoute(route: NonNullable<OsrmResponse["routes"]>[0]): RouteInfo | null {
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

/** Маршрут по дорогах через OSRM (безкоштовно, без додаткового API ключа) */
export async function fetchDrivingRoute(
  from: Coordinates,
  to: Coordinates
): Promise<RouteInfo | null> {
  const routes = await fetchDrivingRoutes(from, to, 1);
  return routes[0] ?? null;
}

/** До 3 альтернативних маршрутів (Premium) */
export async function fetchDrivingRoutes(
  from: Coordinates,
  to: Coordinates,
  alternatives = 3
): Promise<RouteInfo[]> {
  const altParam = alternatives > 1 ? "&alternatives=true" : "";
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson${altParam}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = (await response.json()) as OsrmResponse;
    const routes = (data.routes ?? [])
      .map(parseOsrmRoute)
      .filter((r): r is RouteInfo => r != null)
      .slice(0, alternatives);

    if (routes.length > 1) {
      routes.sort((a, b) => a.distanceMeters - b.distanceMeters);
      routes[0].label = "Найкоротший";
      if (routes[1]) routes[1].label = "Альтернатива";
      if (routes[2]) routes[2].label = "Інший шлях";
    }

    return routes;
  } catch {
    return [];
  }
}

/** Мульти-точковий маршрут (Premium) */
export async function fetchMultiStopRoute(
  points: Coordinates[]
): Promise<RouteInfo | null> {
  if (points.length < 2) return null;

  const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(";");
  const url =
    `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as OsrmResponse;
    const route = parseOsrmRoute(data.routes?.[0] as NonNullable<OsrmResponse["routes"]>[0]);
    if (route) route.label = `${points.length} зупинок`;
    return route;
  } catch {
    return null;
  }
}

export function formatRouteDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} хв`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} год ${rest} хв` : `${hours} год`;
}

export function getRemainingRouteDistance(
  userPos: Coordinates,
  route: Coordinates[]
): number {
  if (route.length < 2) return 0;
  let minIdx = 0;
  let minDist = Infinity;
  route.forEach((p, i) => {
    const d =
      Math.abs(p.latitude - userPos.latitude) + Math.abs(p.longitude - userPos.longitude);
    if (d < minDist) {
      minDist = d;
      minIdx = i;
    }
  });

  let remaining = 0;
  for (let i = minIdx; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    remaining += haversineMeters(a, b);
  }
  return remaining;
}

function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

