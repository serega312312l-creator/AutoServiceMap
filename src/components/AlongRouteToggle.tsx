import { Pressable, StyleSheet, Text } from "react-native";

interface AlongRouteToggleProps {
  enabled: boolean;
  count: number;
  onToggle: () => void;
}

export function AlongRouteToggle({ enabled, count, onToggle }: AlongRouteToggleProps) {
  return (
    <Pressable style={[styles.bar, enabled && styles.barOn]} onPress={onToggle}>
      <Text style={styles.text}>
        {enabled ? "🛣 По дорозі" : "📍 Поруч"} · {count} місць
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    top: 118,
    right: 12,
    backgroundColor: "rgba(30,41,59,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    zIndex: 14,
  },
  barOn: { backgroundColor: "rgba(124,58,237,0.95)", borderColor: "#a78bfa" },
  text: { color: "#f8fafc", fontWeight: "700", fontSize: 12 },
});
