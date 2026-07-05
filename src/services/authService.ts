import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "@/types/user";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const GUEST_KEY = "avtogid:guest_user";

function mapUser(id: string, email: string | null, displayName: string | null, isGuest: boolean): AuthUser {
  return { id, email, displayName, isGuest };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const u = data.session.user;
      return mapUser(u.id, u.email ?? null, u.user_metadata?.display_name ?? null, false);
    }
  }

  const guestRaw = await AsyncStorage.getItem(GUEST_KEY);
  if (guestRaw) {
    const guest = JSON.parse(guestRaw) as AuthUser;
    return guest;
  }
  return null;
}

export async function continueAsGuest(): Promise<AuthUser> {
  const existing = await getCurrentUser();
  if (existing?.isGuest) return existing;

  const guest = mapUser(`guest-${Date.now()}`, null, "Гість", true);
  await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  return guest;
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase не налаштовано. Додайте SUPABASE_URL та SUPABASE_ANON_KEY.");

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName?.trim() || email.split("@")[0] } },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Не вдалося створити акаунт");

  await AsyncStorage.removeItem(GUEST_KEY);
  return mapUser(data.user.id, data.user.email ?? null, displayName ?? null, false);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase не налаштовано");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Помилка входу");

  await AsyncStorage.removeItem(GUEST_KEY);
  return mapUser(
    data.user.id,
    data.user.email ?? null,
    data.user.user_metadata?.display_name ?? null,
    false
  );
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
  await AsyncStorage.removeItem(GUEST_KEY);
}

export function isCloudAuthAvailable(): boolean {
  return isSupabaseConfigured;
}
