import { Pressable, StyleSheet, Text, View } from "react-native";
import { Place } from "@/types/place";
import { formatDistance } from "@/services/locationService";

interface NearestNowButtonProps {
  place: Place | null;
  onPress: (place: Place) => void;
  bottomOffset?: number;
}

export function NearestNowButton({ place, onPress, bottomOffset = 24 }: NearestNowButtonProps) {
  if (!place) return null;

  return (
    <Pressable
      style={[styles.btn, { bottom: bottomOffset }]}
      onPress={() => onPress(place)}
    >
      <Text style={styles.emoji}>⚡</Text>
      <View style={styles.textCol}>
        <Text style={styles.title}>Найближчий</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {place.name} · {formatDistance(place.distanceMeters)}
        </Text>
      </View>
    </Pressable>
  );
}

const SOS_LEFT = 16;
const SOS_SIZE = 52;

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    left: SOS_LEFT + SOS_SIZE + 8,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37, 99, 235, 0.95)",
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 20,
    borderWidth: 2,
    borderColor: "#93c5fd",
    minHeight: 52,
  },
  emoji: { fontSize: 20 },
  textCol: { flex: 1 },
  title: { color: "#fff", fontWeight: "800", fontSize: 13 },
  sub: { color: "#bfdbfe", fontSize: 11, marginTop: 1, fontWeight: "600" },
});
