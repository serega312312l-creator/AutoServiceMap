import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  EXTRA_CATEGORY_FILTERS,
  PRIMARY_CATEGORY_FILTERS,
} from "@/constants/categories";
import { PlaceCategory } from "@/types/place";

interface FilterBarProps {
  selected: PlaceCategory;
  onSelect: (category: PlaceCategory) => void;
}

export function FilterBar({ selected, onSelect }: FilterBarProps) {
  const [showExtra, setShowExtra] = useState(false);
  const filters = showExtra
    ? [...PRIMARY_CATEGORY_FILTERS, ...EXTRA_CATEGORY_FILTERS]
    : PRIMARY_CATEGORY_FILTERS;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scroll}
      >
        {filters.map((filter) => {
          const active = selected === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(filter.id)}
            >
              <Text style={styles.emoji}>{filter.emoji}</Text>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.chip, showExtra && styles.chipActive]}
          onPress={() => setShowExtra((v) => !v)}
        >
          <Text style={styles.emoji}>{showExtra ? "▲" : "⋯"}</Text>
          <Text style={[styles.label, showExtra && styles.labelActive]}>
            {showExtra ? "Менше" : "Ще"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxHeight: 44,
  },
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: "#ffffff",
  },
});
