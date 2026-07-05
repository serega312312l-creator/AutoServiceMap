import { Pressable, StyleSheet, Text, View } from "react-native";
import { RATING_OPTIONS } from "@/services/placeRatingService";
import { usePlaceRating } from "@/hooks/usePlaceRatings";

interface PlaceRatingButtonsProps {
  placeId: string;
}

export function PlaceRatingButtons({ placeId }: PlaceRatingButtonsProps) {
  const { summary, rate } = usePlaceRating(placeId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Надійність (ваш відгук)</Text>
      {summary.score > 0 ? (
        <Text style={styles.score}>Надійність: {summary.score}%</Text>
      ) : null}
      <View style={styles.row}>
        {RATING_OPTIONS.map((opt) => (
          <Pressable key={opt.value} style={styles.chip} onPress={() => rate(opt.value)}>
            <Text style={styles.emoji}>{opt.emoji}</Text>
            <Text style={styles.label}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  title: { color: "#94a3b8", fontSize: 13, fontWeight: "700", textTransform: "uppercase", marginBottom: 8 },
  score: { color: "#4ade80", fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    minWidth: "45%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#334155",
  },
  emoji: { fontSize: 20 },
  label: { color: "#cbd5e1", fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
});
