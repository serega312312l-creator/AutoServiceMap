import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UKRAINE_REGIONS } from "@/constants/regions";
import {
  getDownloadedRegions,
  downloadRegion,
  deleteRegionDownload,
  DownloadedRegion,
  getTotalOfflineSizeKb,
} from "@/services/offlineRegionService";
import { usePremium } from "@/hooks/usePremium";
import { PremiumGate } from "@/components/PremiumGate";

export default function OfflineMapsScreen() {
  const { isPremium } = usePremium();
  const [downloaded, setDownloaded] = useState<DownloadedRegion[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setDownloaded(await getDownloadedRegions());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDownload = async (regionId: string) => {
    setLoading(regionId);
    await downloadRegion(regionId);
    await refresh();
    setLoading(null);
  };

  const handleDelete = async (regionId: string) => {
    await deleteRegionDownload(regionId);
    await refresh();
  };

  const totalKb = getTotalOfflineSizeKb(downloaded);
  const downloadedIds = new Set(downloaded.map((d) => d.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="Офлайн-карти регіонів">
        <Text style={styles.hint}>
          Завантажте область — усі СТО, евакуатори та АЗС збережуться на телефоні для роботи без інтернету.
        </Text>

        {downloaded.length > 0 ? (
          <Text style={styles.stats}>
            Завантажено: {downloaded.length} регіонів · {totalKb} КБ
          </Text>
        ) : null}

        {UKRAINE_REGIONS.map((region) => {
          const isDownloaded = downloadedIds.has(region.id);
          const info = downloaded.find((d) => d.id === region.id);

          return (
            <View key={region.id} style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.regionName}>{region.name} область</Text>
                {info ? (
                  <Text style={styles.regionMeta}>
                    {info.placeCount} місць · {info.sizeKb} КБ
                  </Text>
                ) : null}
              </View>
              {loading === region.id ? (
                <ActivityIndicator color="#60a5fa" />
              ) : isDownloaded ? (
                <Pressable style={styles.delBtn} onPress={() => handleDelete(region.id)}>
                  <Text style={styles.delText}>Видалити</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.dlBtn} onPress={() => handleDownload(region.id)}>
                  <Text style={styles.dlText}>⬇ Завантажити</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </PremiumGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: "#94a3b8", lineHeight: 20, marginBottom: 16 },
  stats: { color: "#4ade80", fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowInfo: { flex: 1 },
  regionName: { color: "#f8fafc", fontWeight: "700" },
  regionMeta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  dlBtn: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  dlText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  delBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  delText: { color: "#f87171", fontWeight: "600", fontSize: 12 },
});
