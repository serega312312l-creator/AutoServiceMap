import { Place } from "@/types/place";
import { ScenarioId } from "@/types/scenario";

export type HistoryEventType =
  | "visit"
  | "call"
  | "route"
  | "breakdown"
  | "sos"
  | "share_location";

export interface HistoryEntry {
  id: string;
  type: HistoryEventType;
  placeId?: string;
  placeName?: string;
  scenarioId?: ScenarioId;
  note?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export interface HistoryExportData {
  generatedAt: string;
  entries: HistoryEntry[];
  places: Place[];
}
