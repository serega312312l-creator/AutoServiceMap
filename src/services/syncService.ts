import { getSupabase } from "@/lib/supabase";
import { getFavorites, setFavorites } from "@/services/savedPlacesService";
import { getPlaceLists, setPlaceLists } from "@/services/placeListsService";
import { UserSyncPayload } from "@/types/user";
import { getCurrentUser } from "@/services/authService";

export async function pullCloudSync(): Promise<boolean> {
  const user = await getCurrentUser();
  const supabase = getSupabase();
  if (!user || user.isGuest || !supabase) return false;

  const { data, error } = await supabase
    .from("user_sync_data")
    .select("favorites, lists, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return false;

  const payload: UserSyncPayload = {
    favorites: data.favorites ?? [],
    lists: data.lists ?? [],
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };

  if (payload.favorites.length > 0) await setFavorites(payload.favorites);
  if (payload.lists.length > 0) await setPlaceLists(payload.lists);
  return true;
}

export async function pushCloudSync(): Promise<boolean> {
  const user = await getCurrentUser();
  const supabase = getSupabase();
  if (!user || user.isGuest || !supabase) return false;

  const favorites = await getFavorites();
  const lists = await getPlaceLists();
  const updatedAt = new Date().toISOString();

  const { error } = await supabase.from("user_sync_data").upsert({
    user_id: user.id,
    favorites,
    lists,
    updated_at: updatedAt,
  });

  return !error;
}

export async function syncWithCloud(): Promise<{ pulled: boolean; pushed: boolean }> {
  const pulled = await pullCloudSync();
  const pushed = await pushCloudSync();
  return { pulled, pushed };
}
