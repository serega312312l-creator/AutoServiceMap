import { Place } from "@/types/place";

let pendingBuildRoute: Place | null = null;

export function setPendingBuildRoute(place: Place): void {
  pendingBuildRoute = place;
}

export function consumePendingBuildRoute(): Place | null {
  const place = pendingBuildRoute;
  pendingBuildRoute = null;
  return place;
}
