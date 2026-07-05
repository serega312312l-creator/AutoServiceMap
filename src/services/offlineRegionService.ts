import { UKRAINE_REGIONS } from "@/constants/regions";
import { loadLocalDatabase } from "@/services/localDatabaseService";
import { getJson, setJson } from "@/services/storageUtils";
import { StructuredPlaceRecord } from "@/types/place";

const DOWNLOADED_KEY = "avtogid:offline_regions";

export interface DownloadedRegion {
  id: string;
  name: string;
  placeCount: number;
  downloadedAt: string;
  sizeKb: number;
}

export async function getDownloadedRegions(): Promise<DownloadedRegion[]> {
  return getJson<DownloadedRegion[]>(DOWNLOADED_KEY, []);
}

export async function isRegionDownloaded(regionId: string): Promise<boolean> {
  const regions = await getDownloadedRegions();
  return regions.some((r) => r.id === regionId);
}

/** Зберігає місця регіону з локальної бази для офлайн-доступу (Premium) */
export async function downloadRegion(regionId: string): Promise<DownloadedRegion | null> {
  const region = UKRAINE_REGIONS.find((r) => r.id === regionId);
  if (!region) return null;

  const records = await loadLocalDatabase();
  const regionPlaces = filterRecordsByRegion(records, region.name, region.id);

  const cacheKey = `avtogid:region_data:${regionId}`;
  await setJson(cacheKey, regionPlaces);

  const entry: DownloadedRegion = {
    id: regionId,
    name: region.name,
    placeCount: regionPlaces.length,
    downloadedAt: new Date().toISOString(),
    sizeKb: Math.round(JSON.stringify(regionPlaces).length / 1024),
  };

  const existing = await getDownloadedRegions();
  const updated = [...existing.filter((r) => r.id !== regionId), entry];
  await setJson(DOWNLOADED_KEY, updated);

  return entry;
}

export async function deleteRegionDownload(regionId: string): Promise<void> {
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  await AsyncStorage.removeItem(`avtogid:region_data:${regionId}`);
  await setJson(
    DOWNLOADED_KEY,
    (await getDownloadedRegions()).filter((r) => r.id !== regionId)
  );
}

export async function getRegionCachedPlaces(regionId: string): Promise<StructuredPlaceRecord[]> {
  return getJson<StructuredPlaceRecord[]>(`avtogid:region_data:${regionId}`, []);
}

function filterRecordsByRegion(
  records: StructuredPlaceRecord[],
  regionName: string,
  regionId: string
): StructuredPlaceRecord[] {
  const nameLower = regionName.toLowerCase();
  const idMap: Record<string, string[]> = {
    kyiv: ["київ", "kyiv", "kiev"],
    lviv: ["львів", "lviv"],
    odesa: ["одес", "odesa"],
    kharkiv: ["харків", "kharkiv"],
  };

  const keywords = idMap[regionId] ?? [nameLower.replace("ська", "").replace("ька", "")];

  return records.filter((r) => {
    const region = (r.region_name ?? "").toLowerCase();
    const city = (r.city ?? "").toLowerCase();
    return keywords.some((k) => region.includes(k) || city.includes(k)) || region.includes(nameLower.slice(0, 4));
  });
}

export function getTotalOfflineSizeKb(regions: DownloadedRegion[]): number {
  return regions.reduce((sum, r) => sum + r.sizeKb, 0);
}
