import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { RATING_OPTIONS } from "@/services/placeRatingService";
import { usePlaceRating } from "@/hooks/usePlaceRatings";

interface PlaceRatingButtonsProps {
  placeId: string;
}

export function PlaceRatingButtons({ placeId }: PlaceRatingButtonsProps) {
  const { summary, userRating, justRated, rate } = usePlaceRating(placeId);

  const handleRate = async (value: typeof RATING_OPTIONS[number]["value"]) => {
    await rate(value);
    const label = RATING_OPTIONS.find((o) => o.value === value)?.label ?? "";
    Alert.alert("Дякуємо!", `Ваш відгук «${label}» збережено.`);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Надійність (ваш відгук)</Text>
      {summary.score > 0 ? (
        <Text style={styles.score}>Надійність за відгуками: {summary.score}%</Text>
      ) : (
        <Text style={styles.hint}>Натисніть, щоб оцінити — допоможете іншим водіям</Text>
      )}
      {justRated ? <Text style={styles.thanks}>✓ Збережено</Text> : null}
      <View style={styles.row}>
        {RATING_OPTIONS.map((opt) => {
          const selected = userRating === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => handleRate(opt.value)}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  title: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  hint: { color: "#64748b", fontSize: 12, marginBottom: 8 },
  score: { color: "#4ade80", fontWeight: "700", marginBottom: 8 },
  thanks: { color: "#4ade80", fontWeight: "700", marginBottom: 8, fontSize: 13 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    minWidth: "45%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: "#334155",
  },
  chipSelected: {
    backgroundColor: "#1e3a8a",
    borderColor: "#60a5fa",
  },
  emoji: { fontSize: 20 },
  label: { color: "#cbd5e1", fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  labelSelected: { color: "#fff", fontWeight: "800" },
});
