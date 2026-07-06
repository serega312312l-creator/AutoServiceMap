import { Pressable, ScrollView, Share, StyleSheet, Text, View, Alert } from "react-native";
import { useHistory } from "@/hooks/useHistory";
import { usePremium } from "@/hooks/usePremium";
import { useUserLocation } from "@/hooks/useUserLocation";
import { PremiumGate } from "@/components/PremiumGate";
import { exportInsurancePdf } from "@/services/pdfExportService";

const TYPE_LABELS: Record<string, string> = {
  visit: "👁 Візит",
  call: "📞 Дзвінок",
  route: "🗺 Маршрут",
  breakdown: "🆘 Поломка",
  sos: "🚨 SOS",
  share_location: "📍 Локація",
};

export default function HistoryScreen() {
  const { isPremium } = usePremium();
  const { entries, exportText, clear } = useHistory();
  const { location } = useUserLocation();

  const handleExport = () => {
    Share.share({ message: exportText(), title: "AVTOGID історія" });
  };

  const handlePdf = async () => {
    try {
      await exportInsurancePdf({
        entries,
        location: location
          ? { lat: location.latitude, lng: location.longitude }
          : undefined,
      });
    } catch {
      Alert.alert("Помилка", "Не вдалося створити PDF");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="Історія та експорт">
        <View style={styles.actions}>
          <Pressable style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>📤 Текст</Text>
          </Pressable>
          <Pressable style={styles.pdfBtn} onPress={handlePdf}>
            <Text style={styles.exportText}>📄 PDF</Text>
          </Pressable>
          <Pressable style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearText}>Очистити</Text>
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>Історія порожня. Візити та маршрути з&apos;являться тут.</Text>
        ) : (
          entries.map((e) => (
            <View key={e.id} style={styles.row}>
              <Text style={styles.type}>{TYPE_LABELS[e.type] ?? e.type}</Text>
              <Text style={styles.name}>{e.placeName ?? e.note ?? ""}</Text>
              <Text style={styles.date}>
                {new Date(e.timestamp).toLocaleString("uk-UA")}
              </Text>
            </View>
          ))
        )}
      </PremiumGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  actions: { flexDirection: "row", gap: 8, marginBottom: 16 },
  exportBtn: { flex: 1, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, alignItems: "center" },
  pdfBtn: { flex: 1, backgroundColor: "#7c3aed", padding: 12, borderRadius: 10, alignItems: "center" },
  exportText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  clearBtn: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  clearText: { color: "#94a3b8", fontWeight: "600" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 40 },
  row: { backgroundColor: "#1e293b", padding: 12, borderRadius: 10, marginBottom: 8 },
  type: { color: "#93c5fd", fontWeight: "700", fontSize: 13 },
  name: { color: "#f8fafc", marginTop: 4, fontWeight: "600" },
  date: { color: "#64748b", fontSize: 11, marginTop: 4 },
});
