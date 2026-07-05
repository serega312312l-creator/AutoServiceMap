import { Pressable, StyleSheet, Text } from "react-native";
import {
  isVoiceGuidanceEnabled,
  setVoiceGuidanceEnabled,
} from "@/services/voiceGuidanceService";
import { useEffect, useState } from "react";

export function VoiceToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isVoiceGuidanceEnabled());
  }, []);

  const toggle = () => {
    const next = !on;
    setVoiceGuidanceEnabled(next);
    setOn(next);
  };

  return (
    <Pressable style={[styles.btn, on && styles.btnOn]} onPress={toggle}>
      <Text style={styles.text}>{on ? "🔊 Голос увімк." : "🔇 Голос вимк."}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 200,
    right: 12,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  btnOn: { borderColor: "#60a5fa", backgroundColor: "rgba(30, 58, 138, 0.95)" },
  text: { color: "#f8fafc", fontWeight: "700", fontSize: 12 },
});
