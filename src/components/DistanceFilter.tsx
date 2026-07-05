import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { DISTANCE_OPTIONS } from "@/constants/categories";

interface DistanceFilterProps {
  selectedMeters: number;
  onSelect: (meters: number) => void;
}

export function DistanceFilter({ selectedMeters, onSelect }: DistanceFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      <Text style={styles.prefix}>Радіус:</Text>
      {DISTANCE_OPTIONS.map((option) => {
        const active = selectedMeters === option.meters;
        return (
          <TouchableOpacity
            key={option.meters}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(option.meters)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    maxHeight: 36,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  prefix: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 2,
  },
  chip: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: "#ffffff",
  },
});
