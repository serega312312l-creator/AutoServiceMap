import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";
import { CATEGORY_FILTERS } from "@/constants/categories";

interface PlaceCardProps {
  place: Place;
  onPress: (place: Place) => void;
}

function getCategoryLabel(category: Place["category"]): string {
  return CATEGORY_FILTERS.find((item) => item.id === category)?.label ?? category;
}

export function PlaceCard({ place, onPress }: PlaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(place)}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.distance}>{formatDistance(place.distanceMeters)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.category}>{getCategoryLabel(place.category)}</Text>
        <Text style={styles.source}>{place.source === "google" ? "Google" : "OSM"}</Text>
        {place.rating != null && <Text style={styles.rating}>★ {place.rating.toFixed(1)}</Text>}
        {place.isOpen != null && (
          <Text style={[styles.status, place.isOpen ? styles.open : styles.closed]}>
            {place.isOpen ? "Відкрито" : "Зачинено"}
          </Text>
        )}
      </View>

      {place.address ? (
        <Text style={styles.address} numberOfLines={2}>
          {place.address}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  name: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  distance: {
    color: "#60a5fa",
    fontSize: 14,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  category: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  source: {
    color: "#64748b",
    fontSize: 12,
  },
  rating: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "600",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  open: {
    color: "#4ade80",
  },
  closed: {
    color: "#f87171",
  },
  address: {
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
  },
});
