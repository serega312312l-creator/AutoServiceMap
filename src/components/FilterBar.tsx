import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { PlaceCategory } from "@/types/place";

interface FilterBarProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export function FilterBar({ selected, onSelect }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORY_FILTERS.map((filter) => {
        const active = selected === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(filter.id)}
          >
            <Text style={styles.emoji}>{filter.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: "#ffffff",
  },
});
