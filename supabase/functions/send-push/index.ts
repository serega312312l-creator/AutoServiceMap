// Supabase Edge Function: send-push
// Деплой: supabase functions deploy send-push --no-verify-jwt
// Для broadcast: передайте Authorization: Bearer SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushBody {
  title: string;
  body: string;
  mode?: "self" | "broadcast";
  newPlacesCount?: number;
  regionName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

async function sendExpoPush(tokens: string[], title: string, body: string) {
  const messages = tokens
    .filter((t) => t.startsWith("ExponentPushToken"))
    .map((to) => ({
      to,
      title,
      body,
      sound: "default",
      priority: "high",
      channelId: "default",
    }));

  if (messages.length === 0) return { sent: 0 };

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });

  const json = await res.json();
  return { sent: messages.length, response: json };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const payload = (await req.json()) as PushBody;
    const { title, body, mode = "self" } = payload;

    let userIds: string[] = [];

    if (mode === "self") {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader ?? "" } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      userIds = [userData.user.id];
    } else {
      // broadcast — потрібен service role
      if (!authHeader?.includes(serviceKey)) {
        return new Response(JSON.stringify({ error: "Service role required" }), { status: 403 });
      }
      const admin = createClient(supabaseUrl, serviceKey);
      const { data: tokens } = await admin.from("user_push_tokens").select("user_id, latitude, longitude, notify_radius_km, expo_token");

      if (!tokens?.length) {
        return new Response(JSON.stringify({ sent: 0, reason: "no tokens" }));
      }

      const { latitude, longitude, radiusKm = 80 } = payload;
      if (latitude != null && longitude != null) {
        userIds = tokens
          .filter((t) => {
            if (t.latitude == null || t.longitude == null) return false;
            const dist = haversineKm(latitude, longitude, t.latitude, t.longitude);
            return dist <= (t.notify_radius_km ?? radiusKm);
          })
          .map((t) => t.user_id);
      } else {
        userIds = tokens.map((t) => t.user_id);
      }
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: rows } = await admin
      .from("user_push_tokens")
      .select("expo_token")
      .in("user_id", userIds);

    const expoTokens = (rows ?? [])
      .map((r) => r.expo_token)
      .filter((t): t is string => Boolean(t));

    const result = await sendExpoPush(expoTokens, title, body);

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
