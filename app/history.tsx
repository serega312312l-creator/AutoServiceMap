import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useHistory } from "@/hooks/useHistory";
import { usePremium } from "@/hooks/usePremium";
import { PremiumGate } from "@/components/PremiumGate";

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

  const handleExport = () => {
    Share.share({ message: exportText(), title: "AVTOGID історія" });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="Історія та експорт">
        <View style={styles.actions}>
          <Pressable style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportText}>📤 Експорт для страхової</Text>
          </Pressable>
          <Pressable style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearText}>Очистити</Text>
          </Pressable>
        </View>

        {entries.length === 0 ? (
          <Text style={styles.empty}>Історія порожня. Візити та маршрути з'являться тут.</Text>
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
  exportText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  clearBtn: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  clearText: { color: "#94a3b8", fontWeight: "600" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 40 },
  row: { backgroundColor: "#1e293b", padding: 12, borderRadius: 10, marginBottom: 8 },
  type: { color: "#93c5fd", fontWeight: "700", fontSize: 13 },
  name: { color: "#f8fafc", marginTop: 4, fontWeight: "600" },
  date: { color: "#64748b", fontSize: 11, marginTop: 4 },
});
