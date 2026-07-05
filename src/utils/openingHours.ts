import { Place } from "@/types/place";

const DAY_MAP: Record<string, number> = {
  mo: 1,
  tu: 2,
  we: 3,
  th: 4,
  fr: 5,
  sa: 6,
  su: 0,
};

function parseTime(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function isDayInRange(day: number, range: string): boolean {
  const parts = range.toLowerCase().split("-");
  if (parts.length === 1) {
    const d = DAY_MAP[parts[0].slice(0, 2)];
    return d === day;
  }
  const start = DAY_MAP[parts[0].slice(0, 2)];
  const end = DAY_MAP[parts[1].slice(0, 2)];
  if (start == null || end == null) return false;
  if (start <= end) return day >= start && day <= end;
  return day >= start || day <= end;
}

/** Грубий парсер OSM opening_hours для «відкрито зараз» */
export function isOpenNowFromHours(openingHours?: string, now = new Date()): boolean | null {
  if (!openingHours) return null;
  const raw = openingHours.trim().toLowerCase();
  if (raw === "24/7" || raw.includes("24 hours")) return true;

  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const segments = raw.split(";").map((s) => s.trim());
  for (const seg of segments) {
    const match = seg.match(/^([a-z]{2}(?:-[a-z]{2})?)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/i);
    if (!match) continue;
    const [, dayRange, openStr, closeStr] = match;
    if (!isDayInRange(day, dayRange)) continue;
    const open = parseTime(openStr);
    const close = parseTime(closeStr);
    if (open == null || close == null) continue;
    if (close < open) {
      if (minutes >= open || minutes <= close) return true;
    } else if (minutes >= open && minutes <= close) {
      return true;
    }
  }
  return false;
}

export function resolvePlaceOpenStatus(place: Place, now = new Date()): boolean | null {
  if (place.isOpen != null) return place.isOpen;
  return isOpenNowFromHours(place.openingHours, now);
}

export function filterOpenNowPlaces(places: Place[]): Place[] {
  return places.filter((p) => {
    const status = resolvePlaceOpenStatus(p);
    return status === true;
  });
}
