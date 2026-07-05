import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Place } from "@/types/place";
import { formatDistance } from "@/services/locationService";

const WIDGET_DATA_KEY = "avtogid:widget_snapshot";

export interface WidgetSnapshot {
  nearestName: string;
  nearestDistance: string;
  nearestCategory: string;
  stoName: string;
  towName: string;
  updatedAt: string;
}

const EMPTY: WidgetSnapshot = {
  nearestName: "Відкрийте AVTOGID",
  nearestDistance: "—",
  nearestCategory: "sto",
  stoName: "—",
  towName: "—",
  updatedAt: new Date().toISOString(),
};

export async function getWidgetSnapshot(): Promise<WidgetSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return raw ? (JSON.parse(raw) as WidgetSnapshot) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function updateWidgetSnapshot(options: {
  nearest?: Place | null;
  nearestSto?: Place | null;
  nearestTow?: Place | null;
}): Promise<void> {
  const nearest = options.nearest;
  const sto = options.nearestSto;
  const tow = options.nearestTow;

  const snapshot: WidgetSnapshot = {
    nearestName: nearest?.name ?? "Немає даних",
    nearestDistance:
      nearest?.distanceMeters != null ? formatDistance(nearest.distanceMeters) : "—",
    nearestCategory: nearest?.category ?? "sto",
    stoName: sto?.name ?? "—",
    towName: tow?.name ?? "—",
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(snapshot));

  if (Platform.OS !== "android") return;

  try {
    const { refreshAndroidWidget } = await import("@/widgets/android/refresh-widget");
    await refreshAndroidWidget(snapshot);
  } catch {
    // Native widget not in dev client yet
  }
}
