import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const url = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("YOUR_"));

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
