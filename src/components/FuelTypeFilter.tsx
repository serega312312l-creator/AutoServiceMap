import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { FUEL_FILTER_OPTIONS, FuelFilterOption } from "@/constants/fuel";
import { FuelType } from "@/types/car";

interface FuelTypeFilterProps {
  selected: FuelType | "all";
  onSelect: (fuel: FuelType | "all") => void;
}

export function FuelTypeFilter({ selected, onSelect }: FuelTypeFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FUEL_FILTER_OPTIONS.map((opt: FuelFilterOption) => (
        <Pressable
          key={opt.id}
          style={[styles.chip, selected === opt.id && styles.chipOn]}
          onPress={() => onSelect(opt.id)}
        >
          <Text style={styles.emoji}>{opt.emoji}</Text>
          <Text style={[styles.label, selected === opt.id && styles.labelOn]}>{opt.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6, paddingHorizontal: 12, paddingVertical: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(30,41,59,0.95)",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipOn: { backgroundColor: "#7c3aed", borderColor: "#a78bfa" },
  emoji: { fontSize: 12 },
  label: { color: "#cbd5e1", fontSize: 11, fontWeight: "600" },
  labelOn: { color: "#fff" },
});
