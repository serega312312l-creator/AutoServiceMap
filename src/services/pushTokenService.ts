import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getCurrentUser } from "@/services/authService";
import { requestNotificationPermission } from "@/services/notificationService";

export interface PushRegistrationResult {
  expoToken: string | null;
  fcmToken: string | null;
  saved: boolean;
}

export async function registerPushTokens(location?: {
  latitude: number;
  longitude: number;
}): Promise<PushRegistrationResult> {
  const user = await getCurrentUser();
  if (!user || user.isGuest || !isSupabaseConfigured) {
    return { expoToken: null, fcmToken: null, saved: false };
  }

  const allowed = await requestNotificationPermission();
  if (!allowed) return { expoToken: null, fcmToken: null, saved: false };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  let expoToken: string | null = null;
  let fcmToken: string | null = null;

  try {
    if (projectId) {
      const res = await Notifications.getExpoPushTokenAsync({ projectId });
      expoToken = res.data;
    }
  } catch {
    // Expo push unavailable
  }

  if (Platform.OS === "android") {
    try {
      const device = await Notifications.getDevicePushTokenAsync();
      fcmToken = typeof device.data === "string" ? device.data : String(device.data);
    } catch {
      // FCM requires google-services.json in native build
    }
  }

  if (!expoToken && !fcmToken) {
    return { expoToken, fcmToken, saved: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { expoToken, fcmToken, saved: false };

  const { error } = await supabase.from("user_push_tokens").upsert(
    {
      user_id: user.id,
      expo_token: expoToken,
      fcm_token: fcmToken,
      platform: Platform.OS,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { expoToken, fcmToken, saved: !error };
}

/** Запит серверного push (працює коли додаток закритий — через Expo/FCM) */
export async function requestServerPush(options: {
  title: string;
  body: string;
  newPlacesCount?: number;
  regionName?: string;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.functions.invoke("send-push", {
    body: {
      title: options.title,
      body: options.body,
      newPlacesCount: options.newPlacesCount,
      regionName: options.regionName,
      mode: "self",
    },
  });

  return !error;
}

export async function notifyServerNewPlacesNearby(
  newCount: number,
  regionName?: string
): Promise<void> {
  if (newCount <= 0) return;
  await requestServerPush({
    title: "AVTOGID — нові СТО",
    body: regionName
      ? `+${newCount} місць у регіоні ${regionName}`
      : `+${newCount} нових місць поруч з вами`,
    newPlacesCount: newCount,
    regionName,
  });
}
