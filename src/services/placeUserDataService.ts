import { generateId, getJson, setJson } from "@/services/storageUtils";
import { normalizeUkrainePhone } from "@/utils/placeFormat";

const COMMENTS_KEY = "avtogid:place_comments";
const USER_PHONES_KEY = "avtogid:place_user_phones";

export interface PlaceComment {
  id: string;
  placeId: string;
  text: string;
  timestamp: string;
}

export interface PlaceUserPhone {
  placeId: string;
  phone: string;
  timestamp: string;
}

export async function getPlaceComments(placeId: string): Promise<PlaceComment[]> {
  const all = await getJson<PlaceComment[]>(COMMENTS_KEY, []);
  return all.filter((c) => c.placeId === placeId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function addPlaceComment(placeId: string, text: string): Promise<PlaceComment> {
  const all = await getJson<PlaceComment[]>(COMMENTS_KEY, []);
  const comment: PlaceComment = {
    id: generateId(),
    placeId,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  };
  all.unshift(comment);
  await setJson(COMMENTS_KEY, all.slice(0, 500));
  return comment;
}

export async function getUserSubmittedPhone(placeId: string): Promise<string | null> {
  const all = await getJson<PlaceUserPhone[]>(USER_PHONES_KEY, []);
  return all.find((p) => p.placeId === placeId)?.phone ?? null;
}

export async function submitUserPhone(placeId: string, rawPhone: string): Promise<string | null> {
  const phone = normalizeUkrainePhone(rawPhone);
  if (!phone) return null;

  const all = await getJson<PlaceUserPhone[]>(USER_PHONES_KEY, []);
  const filtered = all.filter((p) => p.placeId !== placeId);
  filtered.push({ placeId, phone, timestamp: new Date().toISOString() });
  await setJson(USER_PHONES_KEY, filtered);
  return phone;
}
