import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Place } from "@/types/place";

interface SavedPlacesBarProps {
  favorites: Place[];
  recent: Place[];
  onPlacePress: (place: Place) => void;
}

export function SavedPlacesBar({ favorites, recent, onPlacePress }: SavedPlacesBarProps) {
  if (favorites.length === 0 && recent.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {favorites.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Text style={styles.label}>⭐</Text>
          {favorites.map((place) => (
            <Pressable key={place.id} style={styles.chip} onPress={() => onPlacePress(place)}>
              <Text style={styles.chipText} numberOfLines={1}>
                {place.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {recent.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Text style={styles.label}>🕐</Text>
          {recent.slice(0, 5).map((place) => (
            <Pressable key={place.id} style={styles.chipMuted} onPress={() => onPlacePress(place)}>
              <Text style={styles.chipTextMuted} numberOfLines={1}>
                {place.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    gap: 4,
    zIndex: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
  },
  chip: {
    maxWidth: 140,
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipMuted: {
    maxWidth: 120,
    backgroundColor: "rgba(30, 41, 59, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  chipTextMuted: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
  },
});
