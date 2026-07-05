import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BREAKDOWN_SCENARIOS } from "@/constants/scenarios";
import { ScenarioId } from "@/types/scenario";

interface ScenarioPickerProps {
  selected: ScenarioId | null;
  onSelect: (id: ScenarioId) => void;
}

export function ScenarioPicker({ selected, onSelect }: ScenarioPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Що сталось?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {BREAKDOWN_SCENARIOS.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.chip, selected === s.id && styles.chipActive]}
            onPress={() => onSelect(s.id)}
          >
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={[styles.label, selected === s.id && styles.labelActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  title: { color: "#f8fafc", fontWeight: "700", marginBottom: 8, fontSize: 15 },
  row: { gap: 8, paddingRight: 8 },
  chip: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 90,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: { backgroundColor: "#1e3a8a", borderColor: "#60a5fa" },
  emoji: { fontSize: 22, marginBottom: 4 },
  label: { color: "#94a3b8", fontSize: 11, fontWeight: "600", textAlign: "center" },
  labelActive: { color: "#fff" },
});
