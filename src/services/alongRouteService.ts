import { getDistanceMeters } from "@/services/locationService";
import { Coordinates, Place } from "@/types/place";

const MAX_DISTANCE_FROM_ROUTE_M = 2000;

function pointToSegmentDistanceM(
  point: Coordinates,
  a: Coordinates,
  b: Coordinates
): number {
  const dx = b.longitude - a.longitude;
  const dy = b.latitude - a.latitude;
  if (dx === 0 && dy === 0) return getDistanceMeters(point, a);

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.longitude - a.longitude) * dx + (point.latitude - a.latitude) * dy) /
        (dx * dx + dy * dy)
    )
  );

  const proj: Coordinates = {
    latitude: a.latitude + t * dy,
    longitude: a.longitude + t * dx,
  };
  return getDistanceMeters(point, proj);
}

/** Місця вздовж маршруту (не «по прямій», а біля дороги) */
export function findPlacesAlongRoute(
  places: Place[],
  route: Coordinates[],
  maxDistanceM = MAX_DISTANCE_FROM_ROUTE_M
): Place[] {
  if (route.length < 2) return places;

  return places
    .map((place) => {
      let minDist = Infinity;
      for (let i = 0; i < route.length - 1; i++) {
        const d = pointToSegmentDistanceM(place.coordinates, route[i], route[i + 1]);
        if (d < minDist) minDist = d;
      }
      return { place, routeDistance: minDist };
    })
    .filter((x) => x.routeDistance <= maxDistanceM)
    .sort((a, b) => a.routeDistance - b.routeDistance)
    .map((x) => ({ ...x.place, distanceMeters: x.routeDistance }));
}

export function filterAlongRouteMode(
  places: Place[],
  route: Coordinates[] | undefined,
  enabled: boolean
): Place[] {
  if (!enabled || !route?.length) return places;
  return findPlacesAlongRoute(places, route);
}
