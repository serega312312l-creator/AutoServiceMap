import { Place } from "@/types/place";
import { CarProfile } from "@/types/car";
import { HistoryEntry } from "@/types/history";

export type PlaceTag = "my_sto" | "tow" | "fuel" | "azs" | "other";

export const PLACE_TAG_LABELS: Record<PlaceTag, string> = {
  my_sto: "Моє СТО",
  tow: "Евакуатор",
  fuel: "Заправка",
  azs: "АЗС",
  other: "Інше",
};

export interface SavedPlaceEntry {
  place: Place;
  tag?: PlaceTag;
  note?: string;
  savedAt: string;
}

export interface PlaceList {
  id: string;
  name: string;
  places: Place[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
}

export interface UserSyncPayload {
  favorites: SavedPlaceEntry[];
  lists: PlaceList[];
  cars: CarProfile[];
  activeCarId: string | null;
  history: HistoryEntry[];
  updatedAt: string;
}

export interface NotificationPrefs {
  newPlacesNearby: boolean;
  databaseUpdates: boolean;
  favoriteGeofence: boolean;
  geofenceRadiusM: number;
}
