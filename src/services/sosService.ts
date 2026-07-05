import { Linking, Share } from "react-native";
import { SosContact, SafetyTimerState } from "@/types/sos";
import { generateId, getJson, setJson } from "@/services/storageUtils";

const CONTACTS_KEY = "avtogid:sos_contacts";
const TIMER_KEY = "avtogid:safety_timer";
const MAX_CONTACTS = 3;

export async function getSosContacts(): Promise<SosContact[]> {
  return getJson<SosContact[]>(CONTACTS_KEY, []);
}

export async function saveSosContact(
  contact: Omit<SosContact, "id"> & { id?: string }
): Promise<SosContact> {
  const contacts = await getSosContacts();
  const entry: SosContact = {
    ...contact,
    id: contact.id ?? generateId(),
  };

  const idx = contacts.findIndex((c) => c.id === entry.id);
  if (idx >= 0) contacts[idx] = entry;
  else if (contacts.length < MAX_CONTACTS) contacts.push(entry);

  await setJson(CONTACTS_KEY, contacts);
  return entry;
}

export async function deleteSosContact(id: string): Promise<void> {
  await setJson(
    CONTACTS_KEY,
    (await getSosContacts()).filter((c) => c.id !== id)
  );
}

export async function shareLocation(
  latitude: number,
  longitude: number,
  message?: string
): Promise<void> {
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const text =
    message ??
    `🆘 Мені потрібна допомога! Я тут: ${mapsUrl}\nКоординати: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  await Share.share({ message: text, url: mapsUrl });
}

export async function sendSosToContacts(
  latitude: number,
  longitude: number
): Promise<number> {
  const contacts = await getSosContacts();
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const text = `🆘 SOS від AVTOGID! Мені потрібна допомога: ${mapsUrl}`;

  let sent = 0;
  for (const contact of contacts) {
    if (contact.phone) {
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(text)}`;
      try {
        await Linking.openURL(smsUrl);
        sent++;
      } catch {
        // ignore
      }
    }
  }

  if (sent === 0) {
    await Share.share({ message: text });
    sent = 1;
  }

  return sent;
}

export async function getSafetyTimer(): Promise<SafetyTimerState> {
  return getJson<SafetyTimerState>(TIMER_KEY, {
    active: false,
    durationMinutes: 30,
    contactsNotified: false,
  });
}

export async function startSafetyTimer(durationMinutes: number): Promise<void> {
  await setJson(TIMER_KEY, {
    active: true,
    startedAt: new Date().toISOString(),
    durationMinutes,
    contactsNotified: false,
  });
}

export async function stopSafetyTimer(): Promise<void> {
  await setJson(TIMER_KEY, {
    active: false,
    durationMinutes: 30,
    contactsNotified: false,
  });
}

export async function checkSafetyTimerExpired(
  latitude: number,
  longitude: number
): Promise<boolean> {
  const timer = await getSafetyTimer();
  if (!timer.active || !timer.startedAt || timer.contactsNotified) return false;

  const elapsed = Date.now() - new Date(timer.startedAt).getTime();
  const limit = timer.durationMinutes * 60 * 1000;

  if (elapsed >= limit) {
    await sendSosToContacts(latitude, longitude);
    await setJson(TIMER_KEY, { ...timer, contactsNotified: true, active: false });
    return true;
  }
  return false;
}
