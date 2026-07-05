import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getJson, setJson } from "@/services/storageUtils";
import { NotificationPrefs } from "@/types/user";
import { Place, UserLocation } from "@/types/place";
import { getDistanceMeters } from "@/services/locationService";

const PREFS_KEY = "avtogid:notification_prefs";
const GEOFENCE_NOTIFIED_KEY = "avtogid:geofence_notified";
const LAST_DB_COUNT_KEY = "avtogid:last_db_region_count";

const DEFAULT_PREFS: NotificationPrefs = {
  newPlacesNearby: true,
  databaseUpdates: true,
  favoriteGeofence: true,
  geofenceRadiusM: 2000,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return getJson(PREFS_KEY, DEFAULT_PREFS);
}

export async function setNotificationPrefs(prefs: Partial<NotificationPrefs>): Promise<void> {
  const current = await getNotificationPrefs();
  await setJson(PREFS_KEY, { ...current, ...prefs });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "AVTOGID",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}

export async function scheduleLocalNotification(title: string, body: string): Promise<void> {
  const prefs = await getNotificationPrefs();
  if (!prefs.newPlacesNearby && !prefs.databaseUpdates && !prefs.favoriteGeofence) return;

  const allowed = await requestNotificationPermission();
  if (!allowed) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

export async function notifyDatabaseUpdate(newCount: number, regionLabel?: string): Promise<void> {
  const prefs = await getNotificationPrefs();
  if (!prefs.databaseUpdates || newCount <= 0) return;

  const label = regionLabel ? ` (${regionLabel})` : "";
  await scheduleLocalNotification(
    "AVTOGID — оновлення бази",
    `+${newCount} нових місць у вашому регіоні${label}`
  );
}

export async function checkNewPlacesAfterUpdate(
  location: UserLocation,
  currentCount: number,
  regionLabel?: string
): Promise<void> {
  const key = `${location.latitude.toFixed(1)}_${location.longitude.toFixed(1)}`;
  const map = await getJson<Record<string, number>>(LAST_DB_COUNT_KEY, {});
  const prev = map[key] ?? 0;
  map[key] = currentCount;
  await setJson(LAST_DB_COUNT_KEY, map);

  if (prev > 0 && currentCount > prev) {
    const delta = currentCount - prev;
    await notifyDatabaseUpdate(delta, regionLabel);
    const { notifyServerNewPlacesNearby } = await import("@/services/pushTokenService");
    await notifyServerNewPlacesNearby(delta, regionLabel);
  }
}

export async function checkFavoriteGeofence(
  location: UserLocation,
  favorites: Place[]
): Promise<void> {
  const prefs = await getNotificationPrefs();
  if (!prefs.favoriteGeofence || favorites.length === 0) return;

  const notified = await getJson<Record<string, string>>(GEOFENCE_NOTIFIED_KEY, {});
  const today = new Date().toISOString().slice(0, 10);

  for (const place of favorites) {
    const dist = getDistanceMeters(location, place.coordinates);
    if (dist > prefs.geofenceRadiusM) continue;

    const last = notified[place.id];
    if (last === today) continue;

    notified[place.id] = today;
    await scheduleLocalNotification(
      "Поруч обране місце",
      `${place.name} — ${Math.round(dist / 100) / 10} км від вас`
    );
  }
  await setJson(GEOFENCE_NOTIFIED_KEY, notified);
}
