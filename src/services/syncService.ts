import { getJson, setJson } from "@/services/storageUtils";
import { getSupabase } from "@/lib/supabase";
import { getFavorites, setFavorites } from "@/services/savedPlacesService";
import { getPlaceLists, setPlaceLists } from "@/services/placeListsService";
import { getCars, getActiveCarId, setCars, setActiveCarId } from "@/services/carProfileService";
import { getHistory, setHistory } from "@/services/historyService";
import { UserSyncPayload } from "@/types/user";
import { getCurrentUser } from "@/services/authService";

const LOCAL_SYNC_TS_KEY = "avtogid:last_cloud_sync";

async function getLocalSyncTimestamp(): Promise<string | null> {
  return getJson<string | null>(LOCAL_SYNC_TS_KEY, null);
}

async function setLocalSyncTimestamp(iso: string): Promise<void> {
  await setJson(LOCAL_SYNC_TS_KEY, iso);
}

function pickNewer(local: UserSyncPayload, remote: UserSyncPayload): UserSyncPayload {
  const localTs = new Date(local.updatedAt).getTime();
  const remoteTs = new Date(remote.updatedAt).getTime();
  return remoteTs > localTs ? remote : local;
}

export async function pullCloudSync(): Promise<boolean> {
  const user = await getCurrentUser();
  const supabase = getSupabase();
  if (!user || user.isGuest || !supabase) return false;

  const { data, error } = await supabase
    .from("user_sync_data")
    .select("favorites, lists, cars, active_car_id, history, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return false;

  const remote: UserSyncPayload = {
    favorites: data.favorites ?? [],
    lists: data.lists ?? [],
    cars: data.cars ?? [],
    activeCarId: data.active_car_id ?? null,
    history: data.history ?? [],
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };

  const local: UserSyncPayload = {
    favorites: await getFavorites(),
    lists: await getPlaceLists(),
    cars: await getCars(),
    activeCarId: await getActiveCarId(),
    history: await getHistory(),
    updatedAt: (await getLocalSyncTimestamp()) ?? new Date(0).toISOString(),
  };

  const merged = pickNewer(local, remote);

  await setFavorites(merged.favorites);
  await setPlaceLists(merged.lists);
  await setCars(merged.cars);
  if (merged.activeCarId) await setActiveCarId(merged.activeCarId);
  await setHistory(merged.history);
  await setLocalSyncTimestamp(merged.updatedAt);

  return true;
}

export async function pushCloudSync(): Promise<boolean> {
  const user = await getCurrentUser();
  const supabase = getSupabase();
  if (!user || user.isGuest || !supabase) return false;

  const updatedAt = new Date().toISOString();
  const favorites = await getFavorites();
  const lists = await getPlaceLists();
  const cars = await getCars();
  const activeCarId = await getActiveCarId();
  const history = await getHistory();

  const { error } = await supabase.from("user_sync_data").upsert({
    user_id: user.id,
    favorites,
    lists,
    cars,
    active_car_id: activeCarId,
    history,
    updated_at: updatedAt,
  });

  if (!error) await setLocalSyncTimestamp(updatedAt);
  return !error;
}

export async function syncWithCloud(): Promise<{ pulled: boolean; pushed: boolean }> {
  const pulled = await pullCloudSync();
  const pushed = await pushCloudSync();
  return { pulled, pushed };
}
