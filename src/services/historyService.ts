import { HistoryEntry, HistoryEventType } from "@/types/history";
import { Place } from "@/types/place";
import { ScenarioId } from "@/types/scenario";
import { generateId, getJson, setJson } from "@/services/storageUtils";
import { scheduleCloudSync } from "@/services/cloudSyncScheduler";

const HISTORY_KEY = "avtogid:history";
const MAX_HISTORY = 200;

export async function getHistory(): Promise<HistoryEntry[]> {
  return getJson<HistoryEntry[]>(HISTORY_KEY, []);
}

export async function setHistory(entries: HistoryEntry[]): Promise<void> {
  await setJson(HISTORY_KEY, entries.slice(0, MAX_HISTORY));
}

export async function addHistoryEntry(
  type: HistoryEventType,
  data: Partial<HistoryEntry> = {}
): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: generateId(),
    type,
    timestamp: new Date().toISOString(),
    ...data,
  };

  const history = await getHistory();
  history.unshift(entry);
  await setJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  scheduleCloudSync();
  return entry;
}

export async function recordVisit(place: Place): Promise<void> {
  await addHistoryEntry("visit", {
    placeId: place.id,
    placeName: place.name,
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
  });
}

export async function recordCall(place: Place): Promise<void> {
  await addHistoryEntry("call", {
    placeId: place.id,
    placeName: place.name,
  });
}

export async function recordRoute(place: Place): Promise<void> {
  await addHistoryEntry("route", {
    placeId: place.id,
    placeName: place.name,
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
  });
}

export async function recordBreakdown(scenarioId?: ScenarioId): Promise<void> {
  await addHistoryEntry("breakdown", { scenarioId });
}

export async function recordSos(note?: string): Promise<void> {
  await addHistoryEntry("sos", { note });
}

export async function recordShareLocation(lat: number, lng: number): Promise<void> {
  await addHistoryEntry("share_location", { latitude: lat, longitude: lng });
}

export async function clearHistory(): Promise<void> {
  await setJson(HISTORY_KEY, []);
  scheduleCloudSync();
}

export function formatHistoryForExport(entries: HistoryEntry[]): string {
  const lines = entries.map((e) => {
    const date = new Date(e.timestamp).toLocaleString("uk-UA");
    const place = e.placeName ? ` — ${e.placeName}` : "";
    const coords =
      e.latitude != null ? ` (${e.latitude.toFixed(5)}, ${e.longitude?.toFixed(5)})` : "";
    return `[${date}] ${eventLabel(e.type)}${place}${coords}`;
  });
  return `AVTOGID — історія подій\n${"=".repeat(40)}\n\n${lines.join("\n")}\n`;
}

function eventLabel(type: HistoryEventType): string {
  const labels: Record<HistoryEventType, string> = {
    visit: "Візит",
    call: "Дзвінок",
    route: "Маршрут",
    breakdown: "Поломка",
    sos: "SOS",
    share_location: "Поділ локацією",
  };
  return labels[type];
}
