import * as FileSystem from "expo-file-system/legacy";
import { getJson, setJson } from "@/services/storageUtils";

const PHOTOS_META_KEY = "avtogid:place_photos";
const PHOTOS_DIR = `${FileSystem.documentDirectory}avtogid/photos/`;

interface PhotoMeta {
  placeId: string;
  uri: string;
  timestamp: string;
}

export async function getPlacePhotoUri(placeId: string): Promise<string | null> {
  const all = await getJson<PhotoMeta[]>(PHOTOS_META_KEY, []);
  return all.find((p) => p.placeId === placeId)?.uri ?? null;
}

export async function savePlacePhoto(placeId: string, sourceUri: string): Promise<string> {
  await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  const dest = `${PHOTOS_DIR}${placeId}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });

  const all = (await getJson<PhotoMeta[]>(PHOTOS_META_KEY, [])).filter(
    (p) => p.placeId !== placeId
  );
  all.push({ placeId, uri: dest, timestamp: new Date().toISOString() });
  await setJson(PHOTOS_META_KEY, all);
  return dest;
}

export async function deletePlacePhoto(placeId: string): Promise<void> {
  const uri = await getPlacePhotoUri(placeId);
  if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
  const all = (await getJson<PhotoMeta[]>(PHOTOS_META_KEY, [])).filter(
    (p) => p.placeId !== placeId
  );
  await setJson(PHOTOS_META_KEY, all);
}
