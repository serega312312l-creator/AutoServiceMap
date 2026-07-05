import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";
import { openNavigation } from "@/utils/navigation";

interface NearestPlaceBannerProps {
  place: Place;
  expandedSearch?: boolean;
  effectiveRadiusKm?: number;
  onPress: (place: Place) => void;
}

function getCategoryLabel(category: Place["category"]): string {
  return CATEGORY_FILTERS.find((item) => item.id === category)?.label ?? "Сервіс";
}

export function NearestPlaceBanner({
  place,
  expandedSearch,
  effectiveRadiusKm,
  onPress,
}: NearestPlaceBannerProps) {
  const isFar = (place.distanceMeters ?? 0) > 10_000;

  return (
    <Pressable style={styles.banner} onPress={() => onPress(place)}>
      <View style={styles.header}>
        <Text style={styles.badge}>⭐ Найближчий сервіс</Text>
        {isFar && <Text style={styles.farHint}>далеко від міста</Text>}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={styles.meta}>
        {getCategoryLabel(place.category)} · {formatDistance(place.distanceMeters)}
      </Text>
      {expandedSearch && effectiveRadiusKm ? (
        <Text style={styles.expandNote}>
          Пошук розширено до {effectiveRadiusKm} км — ви в зоні з малою кількістю сервісів
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable style={styles.navButton} onPress={() => openNavigation(place)}>
          <Text style={styles.navText}>🧭 Маршрут</Text>
        </Pressable>
        <Pressable style={styles.detailsButton} onPress={() => onPress(place)}>
          <Text style={styles.detailsText}>Деталі →</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badge: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "800",
  },
  farHint: {
    color: "#fbbf24",
    fontSize: 11,
    fontWeight: "600",
  },
  name: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  expandNote: {
    color: "#fbbf24",
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  navText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  detailsButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    justifyContent: "center",
  },
  detailsText: {
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: 13,
  },
});
