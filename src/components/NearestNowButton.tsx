import { Pressable, StyleSheet, Text } from "react-native";
import { Place } from "@/types/place";
import { formatDistance } from "@/services/locationService";

interface NearestNowButtonProps {
  place: Place | null;
  onPress: (place: Place) => void;
}

export function NearestNowButton({ place, onPress }: NearestNowButtonProps) {
  if (!place) return null;

  return (
    <Pressable style={styles.btn} onPress={() => onPress(place)}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>Найближчий зараз</Text>
      <Text style={styles.sub} numberOfLines={1}>
        {place.name} · {formatDistance(place.distanceMeters)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 120,
    left: 12,
    right: 12,
    backgroundColor: "rgba(37, 99, 235, 0.95)",
    borderRadius: 14,
    padding: 14,
    zIndex: 15,
    borderWidth: 2,
    borderColor: "#93c5fd",
  },
  emoji: { fontSize: 20, marginBottom: 2 },
  title: { color: "#fff", fontWeight: "800", fontSize: 16 },
  sub: { color: "#bfdbfe", fontSize: 13, marginTop: 2, fontWeight: "600" },
});
