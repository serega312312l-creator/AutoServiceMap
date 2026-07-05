import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { getJson, setJson } from "@/services/storageUtils";
import { isDeviceOnline } from "@/services/networkService";
import { DatabaseManifest, DatabaseUpdateStatus } from "@/types/database";
import bundledManifest from "../../assets/data/places-manifest.json";

const META_KEY = "avtogid:db_update_meta";
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const DB_DIR = `${FileSystem.documentDirectory}avtogid/`;
const REGIONS_DIR = `${DB_DIR}regions/`;

interface UpdateMeta {
  lastCheckAt: string | null;
  lastUpdateAt: string | null;
  manifestVersion: string | null;
  regionVersions: Record<string, string>;
}

type RefreshListener = () => void;
const refreshListeners = new Set<RefreshListener>();

export function subscribeDatabaseRefresh(listener: RefreshListener): () => void {
  refreshListeners.add(listener);
  return () => refreshListeners.delete(listener);
}

export function notifyDatabaseRefresh(): void {
  refreshListeners.forEach((l) => l());
}

function getManifestUrl(): string | null {
  const url = Constants.expoConfig?.extra?.databaseManifestUrl as string | undefined;
  if (url && url.length > 5 && !url.includes("YOUR_")) return url;
  return null;
}

function getBaseUrl(manifest: DatabaseManifest): string {
  const configured = Constants.expoConfig?.extra?.databaseBaseUrl as string | undefined;
  if (configured && configured.length > 5 && !configured.includes("YOUR_")) {
    return configured.replace(/\/$/, "");
  }
  if (manifest.base_url) return manifest.base_url.replace(/\/$/, "");
  const manifestUrl = getManifestUrl();
  if (manifestUrl) {
    return manifestUrl.replace(/\/places-manifest\.json$/, "");
  }
  return "";
}

async function ensureDirs(): Promise<void> {
  await FileSystem.makeDirectoryAsync(REGIONS_DIR, { intermediates: true });
}

async function getMeta(): Promise<UpdateMeta> {
  return getJson<UpdateMeta>(META_KEY, {
    lastCheckAt: null,
    lastUpdateAt: null,
    manifestVersion: null,
    regionVersions: {},
  });
}

async function saveMeta(meta: UpdateMeta): Promise<void> {
  await setJson(META_KEY, meta);
}

export async function getDatabaseUpdateStatus(): Promise<DatabaseUpdateStatus> {
  const meta = await getMeta();
  const localCount = await countCachedPlaces();
  return {
    checking: false,
    downloading: false,
    lastCheckAt: meta.lastCheckAt,
    lastUpdateAt: meta.lastUpdateAt,
    localCount,
    bundledCount: (bundledManifest as DatabaseManifest).total ?? 0,
    message: null,
    error: null,
  };
}

async function countCachedPlaces(): Promise<number> {
  try {
    const info = await FileSystem.readDirectoryAsync(REGIONS_DIR);
    let total = 0;
    for (const file of info) {
      if (!file.endsWith(".json")) continue;
      const raw = await FileSystem.readAsStringAsync(`${REGIONS_DIR}${file}`);
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) total += arr.length;
    }
    return total;
  } catch {
    return 0;
  }
}

export async function fetchRemoteManifest(): Promise<DatabaseManifest | null> {
  const url = getManifestUrl();
  if (!url) return null;

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Маніфест: HTTP ${response.status}`);
  return (await response.json()) as DatabaseManifest;
}

function isRegionStale(localVersion: string | undefined, remoteVersion: string): boolean {
  if (!localVersion) return true;
  return localVersion !== remoteVersion;
}

/** Завантажити один регіон */
async function downloadRegion(
  baseUrl: string,
  regionId: string,
  version: string
): Promise<number> {
  const url = `${baseUrl}/regions/${regionId}.json`;
  const dest = `${REGIONS_DIR}${regionId}.json`;
  const result = await FileSystem.downloadAsync(url, dest);
  if (result.status !== 200) {
    throw new Error(`Регіон ${regionId}: HTTP ${result.status}`);
  }
  const raw = await FileSystem.readAsStringAsync(dest);
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error(`Регіон ${regionId}: невалідний JSON`);

  const meta = await getMeta();
  meta.regionVersions[regionId] = version;
  await saveMeta(meta);
  return arr.length;
}

/**
 * Перевірка та автоматичне оновлення бази СТО.
 * @param force — ігнорувати 24-годинний інтервал
 * @param priorityRegionIds — спочатку ці регіони (поруч з користувачем)
 */
export async function checkAndUpdateDatabase(options?: {
  force?: boolean;
  priorityRegionIds?: string[];
  onProgress?: (msg: string) => void;
}): Promise<DatabaseUpdateStatus> {
  const { force = false, priorityRegionIds = [], onProgress } = options ?? {};
  const meta = await getMeta();
  const now = Date.now();

  if (!force && meta.lastCheckAt) {
    const elapsed = now - new Date(meta.lastCheckAt).getTime();
    if (elapsed < CHECK_INTERVAL_MS) {
      return getDatabaseUpdateStatus();
    }
  }

  const online = await isDeviceOnline();
  if (!online) {
    return {
      ...(await getDatabaseUpdateStatus()),
      message: "Офлайн — використовуємо збережену базу",
    };
  }

  const manifestUrl = getManifestUrl();
  if (!manifestUrl) {
    meta.lastCheckAt = new Date().toISOString();
    await saveMeta(meta);
    return {
      ...(await getDatabaseUpdateStatus()),
      message: "URL оновлень не налаштовано — вбудована база",
    };
  }

  try {
    onProgress?.("Перевіряємо оновлення...");
    const remote = await fetchRemoteManifest();
    if (!remote?.regions?.length) {
      throw new Error("Порожній маніфест");
    }

    const baseUrl = getBaseUrl(remote);
    if (!baseUrl) throw new Error("Не вказано base_url у маніфесті");

    await ensureDirs();

    const bundled = bundledManifest as DatabaseManifest;
    const needsUpdate = remote.regions.filter((r) =>
      isRegionStale(meta.regionVersions[r.id], r.version)
    );

    const isNewerThanBundle =
      !meta.manifestVersion ||
      new Date(remote.version).getTime() > new Date(bundled.version).getTime();

    if (needsUpdate.length === 0 && !isNewerThanBundle) {
      meta.lastCheckAt = new Date().toISOString();
      await saveMeta(meta);
      return {
        ...(await getDatabaseUpdateStatus()),
        message: "База актуальна",
      };
    }

    const ordered = [...needsUpdate].sort((a, b) => {
      const aPri = priorityRegionIds.indexOf(a.id);
      const bPri = priorityRegionIds.indexOf(b.id);
      if (aPri >= 0 && bPri < 0) return -1;
      if (bPri >= 0 && aPri < 0) return 1;
      return 0;
    });

    let downloaded = 0;
    for (const region of ordered) {
      onProgress?.(`Завантажуємо ${region.name ?? region.id}...`);
      try {
        const count = await downloadRegion(baseUrl, region.id, region.version);
        downloaded += count;
      } catch (e) {
        console.warn(`Region ${region.id} failed:`, e);
      }
    }

    meta.manifestVersion = remote.version;
    meta.lastCheckAt = new Date().toISOString();
    if (downloaded > 0) {
      meta.lastUpdateAt = new Date().toISOString();
      notifyDatabaseRefresh();
    }
    await saveMeta(meta);

    return {
      checking: false,
      downloading: false,
      lastCheckAt: meta.lastCheckAt,
      lastUpdateAt: meta.lastUpdateAt,
      localCount: await countCachedPlaces(),
      bundledCount: bundled.total,
      message:
        downloaded > 0
          ? `Оновлено ${downloaded} місць`
          : "Не вдалося завантажити — використовуємо збережену базу",
      error: null,
    };
  } catch (error) {
    meta.lastCheckAt = new Date().toISOString();
    await saveMeta(meta);
    const msg = error instanceof Error ? error.message : "Помилка оновлення";
    return {
      ...(await getDatabaseUpdateStatus()),
      error: msg,
      message: msg,
    };
  }
}

/** Чи є завантажені регіони на пристрої */
export async function hasCachedDatabase(): Promise<boolean> {
  try {
    const files = await FileSystem.readDirectoryAsync(REGIONS_DIR);
    return files.some((f) => f.endsWith(".json"));
  } catch {
    return false;
  }
}

/** Завантажити всі кешовані регіони */
export async function loadCachedDatabaseRecords(): Promise<unknown[] | null> {
  try {
    const files = await FileSystem.readDirectoryAsync(REGIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    if (jsonFiles.length === 0) return null;

    const all: unknown[] = [];
    for (const file of jsonFiles) {
      const raw = await FileSystem.readAsStringAsync(`${REGIONS_DIR}${file}`);
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) all.push(...arr);
    }
    return all.length > 0 ? all : null;
  } catch {
    return null;
  }
}

export function getBundledManifest(): DatabaseManifest {
  return bundledManifest as DatabaseManifest;
}
