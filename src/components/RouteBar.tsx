import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDistance } from "@/services/locationService";
import { formatRouteDuration } from "@/services/routeService";
import { Place } from "@/types/place";
import { openNavigation } from "@/utils/navigation";

interface RouteBarProps {
  place: Place;
  distanceMeters: number;
  durationSeconds: number;
  loading?: boolean;
  cached?: boolean;
  onClose: () => void;
}

export function RouteBar({
  place,
  distanceMeters,
  durationSeconds,
  loading,
  cached,
  onClose,
}: RouteBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          → {place.name}
        </Text>
        {loading ? (
          <Text style={styles.meta}>Будуємо маршрут...</Text>
        ) : (
          <Text style={styles.meta}>
            {formatDistance(distanceMeters)} · {formatRouteDuration(durationSeconds)}
            {cached ? " · 💾 офлайн" : ""}
          </Text>
        )}
      </View>      <Pressable style={styles.extBtn} onPress={() => openNavigation(place)}>
        <Text style={styles.extText}>GPS</Text>
      </Pressable>
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 16,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    zIndex: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 14,
  },
  meta: {
    color: "#93c5fd",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  extBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  extText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
});
