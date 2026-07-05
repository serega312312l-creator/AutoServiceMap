import { Pressable, StyleSheet, Text } from "react-native";
import { shareLocation } from "@/services/sosService";

interface ShareLocationButtonProps {
  latitude: number;
  longitude: number;
  onShared?: () => void;
  large?: boolean;
}

export function ShareLocationButton({
  latitude,
  longitude,
  onShared,
  large,
}: ShareLocationButtonProps) {
  const handlePress = async () => {
    await shareLocation(latitude, longitude);
    onShared?.();
  };

  return (
    <Pressable style={[styles.btn, large && styles.btnLarge]} onPress={handlePress}>
      <Text style={styles.text}>📍 Поділитися локацією</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnLarge: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#c4b5fd",
  },
  text: { color: "#f8fafc", fontWeight: "700", fontSize: 15 },
});
