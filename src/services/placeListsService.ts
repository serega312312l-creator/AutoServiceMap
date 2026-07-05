import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/types/place";
import { PlaceList } from "@/types/user";
import { pushCloudSync } from "@/services/syncService";

const LISTS_KEY = "avtogid:place_lists";

export async function getPlaceLists(): Promise<PlaceList[]> {
  try {
    const raw = await AsyncStorage.getItem(LISTS_KEY);
    return raw ? (JSON.parse(raw) as PlaceList[]) : [];
  } catch {
    return [];
  }
}

export async function setPlaceLists(lists: PlaceList[]): Promise<void> {
  await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export async function createPlaceList(name: string): Promise<PlaceList> {
  const lists = await getPlaceLists();
  const list: PlaceList = {
    id: `list-${Date.now()}`,
    name: name.trim(),
    places: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lists.unshift(list);
  await setPlaceLists(lists);
  pushCloudSync().catch(() => {});
  return list;
}

export async function addPlaceToList(listId: string, place: Place): Promise<void> {
  const lists = await getPlaceLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  if (!list.places.some((p) => p.id === place.id)) {
    list.places.unshift(place);
    list.updatedAt = new Date().toISOString();
    await setPlaceLists(lists);
    pushCloudSync().catch(() => {});
  }
}

export async function removePlaceFromList(listId: string, placeId: string): Promise<void> {
  const lists = await getPlaceLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.places = list.places.filter((p) => p.id !== placeId);
  list.updatedAt = new Date().toISOString();
  await setPlaceLists(lists);
  pushCloudSync().catch(() => {});
}

export async function deletePlaceList(listId: string): Promise<void> {
  const lists = await getPlaceLists();
  await setPlaceLists(lists.filter((l) => l.id !== listId));
  pushCloudSync().catch(() => {});
}

export async function renamePlaceList(listId: string, name: string): Promise<void> {
  const lists = await getPlaceLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return;
  list.name = name.trim();
  list.updatedAt = new Date().toISOString();
  await setPlaceLists(lists);
  pushCloudSync().catch(() => {});
}
