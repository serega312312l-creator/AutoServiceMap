import { Pressable, StyleSheet, Text, View } from "react-native";
import { DeadZoneWarning } from "@/services/deadZoneService";

interface DeadZoneBannerProps {
  warning: DeadZoneWarning | null;
  onPremiumPress?: () => void;
}

export function DeadZoneBanner({ warning, onPremiumPress }: DeadZoneBannerProps) {
  if (!warning) return null;

  return (
    <View
      style={[
        styles.banner,
        warning.severity === "high" ? styles.high : styles.medium,
      ]}
    >
      <Text style={styles.text}>{warning.message}</Text>
      {onPremiumPress ? (
        <Pressable onPress={onPremiumPress}>
          <Text style={styles.link}>Premium: завантажити регіон →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 56,
    left: 12,
    right: 12,
    borderRadius: 12,
    padding: 12,
    zIndex: 14,
  },
  high: { backgroundColor: "rgba(127, 29, 29, 0.95)", borderWidth: 1, borderColor: "#fca5a5" },
  medium: { backgroundColor: "rgba(120, 53, 15, 0.95)", borderWidth: 1, borderColor: "#fcd34d" },
  text: { color: "#fef2f2", fontSize: 13, fontWeight: "600", lineHeight: 18 },
  link: { color: "#93c5fd", fontSize: 12, fontWeight: "700", marginTop: 6 },
});
