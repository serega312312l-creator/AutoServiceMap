import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PlaceCategory } from "@/types/place";
import {
  EXTRA_CATEGORY_FILTERS,
  PRIMARY_CATEGORY_FILTERS,
} from "@/constants/categories";
import { DISTANCE_OPTIONS } from "@/constants/categories";
import { OfflineBanner } from "@/components/OfflineBanner";
import { formatDistance } from "@/services/locationService";

interface MapOverlayControlsProps {
  viewMode: "map" | "list";
  onViewModeChange: (mode: "map" | "list") => void;
  selectedCategory: PlaceCategory;
  onCategoryChange: (category: PlaceCategory) => void;
  radiusMeters: number;
  onRadiusChange: (meters: number) => void;
  placeCount: number;
  onRefresh: () => void;
  isOffline?: boolean;
  localCount?: number;
  onlineCount?: number;
  locating?: boolean;
  locationAccuracy?: number;
  dbUpdateMessage?: string | null;
}

export function MapOverlayControls({
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange,
  radiusMeters,
  onRadiusChange,
  placeCount,
  onRefresh,
  isOffline,
  localCount = 0,
  onlineCount = 0,
  locating,
  locationAccuracy,
  dbUpdateMessage,
}: MapOverlayControlsProps) {
  const categories = [...PRIMARY_CATEGORY_FILTERS, ...EXTRA_CATEGORY_FILTERS.slice(0, 3)];

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.row}>
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, viewMode === "map" && styles.toggleActive]}
            onPress={() => onViewModeChange("map")}
          >
            <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>Карта</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === "list" && styles.toggleActive]}
            onPress={() => onViewModeChange("list")}
          >
            <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>Список</Text>
          </Pressable>
        </View>
        <Pressable style={styles.iconBtn} onPress={onRefresh}>
          <Text style={styles.iconBtnText}>↻</Text>
        </Pressable>
        <Text style={styles.count}>{placeCount}</Text>
      </View>

      {viewMode === "map" ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsRow}
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.meters}
                style={[styles.chip, radiusMeters === opt.meters && styles.chipActive]}
                onPress={() => onRadiusChange(opt.meters)}
              >
                <Text style={[styles.chipText, radiusMeters === opt.meters && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                onPress={() => onCategoryChange(cat.id)}
              >
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.statusRow}>
            <OfflineBanner
              isOffline={isOffline ?? false}
              localCount={localCount}
              onlineCount={onlineCount}
              variant="compact"
            />
            <Text style={[styles.gpsBadge, locating && styles.gpsSearching]}>
              {locating
                ? "📍 GPS…"
                : locationAccuracy != null
                  ? `📍 ±${formatDistance(locationAccuracy)}`
                  : "📍 GPS"}
            </Text>
            {dbUpdateMessage ? (
              <Text style={styles.dbUpdate} numberOfLines={1}>
                {dbUpdateMessage.includes("Завантаж") ? "⬇ " : "🔄 "}
                {dbUpdateMessage}
              </Text>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 4,
    left: 8,
    right: 8,
    zIndex: 10,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: "#334155",
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "#2563eb",
  },
  toggleText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconBtnText: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "700",
  },
  count: {
    marginLeft: "auto",
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipEmoji: {
    fontSize: 11,
  },
  chipText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
    flexWrap: "wrap",
  },
  gpsBadge: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#14532d",
    overflow: "hidden",
  },
  gpsSearching: {
    color: "#fbbf24",
    borderColor: "#422006",
  },
  dbUpdate: {
    color: "#93c5fd",
    fontSize: 10,
    fontWeight: "600",
    flex: 1,
  },
});
