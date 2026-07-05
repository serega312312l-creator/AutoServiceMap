import { Place, Coordinates, UserLocation } from "@/types/place";
import { getDistanceMeters } from "@/services/locationService";
import { loadLocalDatabase } from "@/services/localDatabaseService";

export interface DeadZoneWarning {
  severity: "high" | "medium";
  message: string;
  nearestServiceKm: number | null;
  gapKm: number;
}

const CRITICAL_CATEGORIES = new Set(["sto", "towing", "tires", "fuel"]);

/** Аналізує покриття СТО в напрямку руху / вздовж маршруту */
export async function analyzeDeadZones(
  location: UserLocation,
  places: Place[],
  heading?: number | null,
  routeCoords?: Coordinates[]
): Promise<DeadZoneWarning | null> {
  const servicePlaces = places.filter((p) => CRITICAL_CATEGORIES.has(p.category));
  if (servicePlaces.length === 0) {
    const nearest = await findNearestServiceAnywhere(location);
    return {
      severity: "high",
      message: "⚠️ Немає СТО в радіусі 100 км! Завантажте офлайн-карту регіону.",
      nearestServiceKm: nearest ? (nearest.distanceMeters ?? 0) / 1000 : null,
      gapKm: 100,
    };
  }

  if (routeCoords && routeCoords.length > 10) {
    return analyzeRouteGaps(routeCoords, servicePlaces);
  }

  if (heading != null) {
    return analyzeHeadingGap(location, servicePlaces, heading);
  }

  const nearest = servicePlaces[0];
  const distKm = (nearest.distanceMeters ?? 0) / 1000;
  if (distKm > 50) {
    return {
      severity: "medium",
      message: `⚠️ Найближче СТО — ${distKm.toFixed(0)} км. Плануйте зупинку.`,
      nearestServiceKm: distKm,
      gapKm: distKm,
    };
  }

  return null;
}

function analyzeRouteGaps(
  route: Coordinates[],
  services: Place[]
): DeadZoneWarning | null {
  const step = Math.max(1, Math.floor(route.length / 20));
  let maxGap = 0;
  let gapStart = 0;

  for (let i = 0; i < route.length; i += step) {
    const point = route[i];
    const nearest = services.reduce((min, s) => {
      const d = getDistanceMeters(point, s.coordinates);
      return d < min ? d : min;
    }, Infinity);

    const gapKm = nearest / 1000;
    if (gapKm > maxGap) {
      maxGap = gapKm;
      gapStart = i;
    }
  }

  if (maxGap > 40) {
    const pct = Math.round((gapStart / route.length) * 100);
    return {
      severity: maxGap > 60 ? "high" : "medium",
      message: `⚠️ На маршруті (≈${pct}% шляху) немає СТО ${maxGap.toFixed(0)} км. Заправтесь / перевірте авто.`,
      nearestServiceKm: maxGap,
      gapKm: maxGap,
    };
  }

  return null;
}

function analyzeHeadingGap(
  location: UserLocation,
  services: Place[],
  heading: number
): DeadZoneWarning | null {
  const ahead = services.filter((s) => {
    const bearing = getBearing(location, s.coordinates);
    const diff = Math.abs(normalizeAngle(bearing - heading));
    return diff < 45;
  });

  if (ahead.length === 0) {
    const nearest = services[0];
    const km = (nearest?.distanceMeters ?? 0) / 1000;
    return {
      severity: "medium",
      message: `⚠️ У напрямку руху немає СТО. Найближче — ${km.toFixed(0)} км позаду/ збоку.`,
      nearestServiceKm: km,
      gapKm: km,
    };
  }

  return null;
}

async function findNearestServiceAnywhere(location: UserLocation): Promise<Place | null> {
  const records = await loadLocalDatabase();
  let minDist = Infinity;
  let nearest: Place | null = null;

  for (const r of records) {
    if (!CRITICAL_CATEGORIES.has(r.category_id)) continue;
    const d = getDistanceMeters(location, { latitude: r.latitude, longitude: r.longitude });
    if (d < minDist) {
      minDist = d;
      nearest = {
        id: r.id,
        name: r.name,
        category: r.category_id,
        source: "local",
        coordinates: { latitude: r.latitude, longitude: r.longitude },
        distanceMeters: d,
      };
    }
  }

  return nearest;
}

function getBearing(from: Coordinates, to: Coordinates): number {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function normalizeAngle(a: number): number {
  return ((a + 180) % 360) - 180;
}
