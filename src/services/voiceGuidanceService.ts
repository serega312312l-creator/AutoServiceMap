import * as Speech from "expo-speech";
import { Coordinates } from "@/types/place";
import { getDistanceMeters } from "@/services/locationService";

let enabled = false;
let lastSpoken = "";

export function setVoiceGuidanceEnabled(value: boolean): void {
  enabled = value;
  if (!value) Speech.stop();
}

export function isVoiceGuidanceEnabled(): boolean {
  return enabled;
}

export function speakInstruction(text: string): void {
  if (!enabled) return;
  if (text === lastSpoken) return;
  lastSpoken = text;
  Speech.stop();
  Speech.speak(text, { language: "uk-UA", rate: 0.95 });
}

export function updateNavigationVoice(
  userPos: Coordinates,
  route: Coordinates[],
  destinationName: string,
  remainingMeters: number
): void {
  if (!enabled || route.length < 2) return;

  if (remainingMeters < 80) {
    speakInstruction(`Ви прибули до ${destinationName}`);
    return;
  }

  if (remainingMeters < 300) {
    speakInstruction(`Через ${Math.round(remainingMeters)} метрів — ${destinationName}`);
    return;
  }

  const nearestIdx = findNearestRouteIndex(userPos, route);
  if (nearestIdx < route.length - 5) {
    const next = route[nearestIdx + 5];
    const bearing = getBearing(userPos, next);
    const dir = bearingToUkrainian(bearing);
    const distToTurn = getDistanceMeters(userPos, next);
    if (distToTurn < 400 && distToTurn > 100) {
      speakInstruction(`Через ${Math.round(distToTurn)} метрів ${dir}`);
    }
  }
}

function findNearestRouteIndex(pos: Coordinates, route: Coordinates[]): number {
  let min = Infinity;
  let idx = 0;
  route.forEach((p, i) => {
    const d = getDistanceMeters(pos, p);
    if (d < min) {
      min = d;
      idx = i;
    }
  });
  return idx;
}

function getBearing(from: Coordinates, to: Coordinates): number {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function bearingToUkrainian(bearing: number): string {
  if (bearing >= 337.5 || bearing < 22.5) return "прямо";
  if (bearing < 67.5) return "тримайтеся праворуч";
  if (bearing < 112.5) return "поверніть праворуч";
  if (bearing < 157.5) return "поверніть праворуч";
  if (bearing < 202.5) return "розверніться";
  if (bearing < 247.5) return "поверніть ліворуч";
  if (bearing < 292.5) return "поверніть ліворуч";
  return "тримайтеся ліворуч";
}
