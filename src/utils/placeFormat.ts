import { Place } from "@/types/place";

/** Парсить рядок з одним або кількома номерами */
export function parsePhoneList(raw?: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[;,/|]/)
    .map((p) => normalizeUkrainePhone(p.trim()))
    .filter((p): p is string => p != null && p.length >= 10);
}

export function normalizeUkrainePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 9) return null;

  let normalized = digits;
  if (normalized.startsWith("380")) {
    normalized = normalized;
  } else if (normalized.startsWith("80") && normalized.length >= 11) {
    normalized = "3" + normalized;
  } else if (normalized.length === 9) {
    normalized = "380" + normalized;
  } else if (normalized.length === 10 && normalized.startsWith("0")) {
    normalized = "38" + normalized;
  }

  if (normalized.length < 12 || !normalized.startsWith("380")) return null;
  return `+${normalized.slice(0, 3)} ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8, 10)} ${normalized.slice(10)}`.trim();
}

export function formatPhoneForDial(phone: string): string {
  return phone.replace(/\s/g, "");
}

/** Повна адреса для відображення */
export function formatDisplayAddress(place: Place): string {
  const lines: string[] = [];

  let streetLine = "";
  if (place.street) {
    streetLine = place.street;
    const addr = place.address ?? "";
    const numMatch = addr.match(/,\s*(\d+[\w/]*)/);
    if (!place.street.includes(",") && numMatch) {
      streetLine = `${place.street}, ${numMatch[1]}`;
    }
  } else if (place.address && !/^\d+$/.test(place.address.trim())) {
    streetLine = place.address.split(",").slice(0, 2).join(",").trim();
  }

  if (streetLine) lines.push(streetLine);

  const city =
    place.city ||
    extractCityFromAddress(place.address) ||
    extractCityFromRegion(place.region);

  if (city) lines.push(city);
  if (place.region && !lines.some((l) => l.includes(place.region!.slice(0, 6)))) {
    lines.push(place.region);
  }

  if (lines.length === 0 && place.address) return place.address;
  return lines.join("\n") || "Адреса не вказана";
}

function extractCityFromAddress(address?: string): string | null {
  if (!address) return null;
  const parts = address.split(",").map((p) => p.trim());
  for (const part of parts) {
    if (part.length > 3 && !/^\d/.test(part) && !/^\d{5}$/.test(part)) {
      if (part.includes("область") || part.includes("м.")) continue;
      if (parts.indexOf(part) > 0) return part;
    }
  }
  return null;
}

function extractCityFromRegion(region?: string): string | null {
  if (!region) return null;
  if (region.includes("м.")) return region;
  return null;
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function formatCoordinatesDms(lat: number, lng: number): string {
  return `${toDms(lat, true)} ${toDms(lng, false)}`;
}

function toDms(value: number, isLat: boolean): string {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const dir = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${deg}°${min}'${dir}`;
}

export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function mergePlaceData(base: Place, enriched: Place | null): Place {
  if (!enriched) return { ...base, phones: parsePhoneList(base.phone) };
  return {
    ...enriched,
    distanceMeters: base.distanceMeters ?? enriched.distanceMeters,
    rating: base.rating ?? enriched.rating,
    isOpen: base.isOpen ?? enriched.isOpen,
    phone: enriched.phone || base.phone,
    phones: [
      ...parsePhoneList(enriched.phone),
      ...parsePhoneList(base.phone),
    ].filter((v, i, a) => a.indexOf(v) === i),
    address: enriched.address || base.address,
  };
}
