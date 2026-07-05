import { Pressable, StyleSheet, Text } from "react-native";

interface OpenNowToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function OpenNowToggle({ enabled, onToggle }: OpenNowToggleProps) {
  return (
    <Pressable style={[styles.chip, enabled && styles.chipOn]} onPress={onToggle}>
      <Text style={[styles.text, enabled && styles.textOn]}>
        {enabled ? "🟢 Відкрито зараз" : "🕐 Відкрито зараз"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(30,41,59,0.95)",
    borderWidth: 1,
    borderColor: "#334155",
    marginHorizontal: 12,
    marginVertical: 4,
    alignSelf: "flex-start",
  },
  chipOn: { backgroundColor: "#14532d", borderColor: "#4ade80" },
  text: { color: "#cbd5e1", fontSize: 11, fontWeight: "700" },
  textOn: { color: "#bbf7d0" },
});
