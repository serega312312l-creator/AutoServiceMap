import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { RouteInfo, formatRouteDuration } from "@/services/routeService";
import { formatDistance } from "@/services/locationService";

interface RouteAlternativesBarProps {
  routes: RouteInfo[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function RouteAlternativesBar({ routes, selectedIndex, onSelect }: RouteAlternativesBarProps) {
  if (routes.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
    >
      {routes.map((route, i) => (
        <Pressable
          key={i}
          style={[styles.chip, selectedIndex === i && styles.chipActive]}
          onPress={() => onSelect(i)}
        >
          <Text style={[styles.label, selectedIndex === i && styles.labelActive]}>
            {route.label ?? `Варіант ${i + 1}`}
          </Text>
          <Text style={[styles.meta, selectedIndex === i && styles.labelActive]}>
            {formatDistance(route.distanceMeters)} · {formatRouteDuration(route.durationSeconds)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 88,
    left: 0,
    right: 0,
    zIndex: 19,
  },
  content: { paddingHorizontal: 12, gap: 8 },
  chip: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: { backgroundColor: "#1e3a8a", borderColor: "#60a5fa" },
  label: { color: "#94a3b8", fontWeight: "700", fontSize: 12 },
  labelActive: { color: "#fff" },
  meta: { color: "#64748b", fontSize: 11, marginTop: 2 },
});
