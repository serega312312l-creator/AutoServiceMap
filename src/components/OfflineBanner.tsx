import { StyleSheet, Text, View } from "react-native";

interface OfflineBannerProps {
  isOffline: boolean;
  localCount: number;
  onlineCount: number;
  variant?: "overlay" | "inline";
}

export function OfflineBanner({
  isOffline,
  localCount,
  onlineCount,
  variant = "overlay",
}: OfflineBannerProps) {
  const containerStyle = variant === "inline" ? styles.inline : styles.banner;

  if (!isOffline && onlineCount > 0) {
    return (
      <View style={[containerStyle, styles.online]}>
        <Text style={[styles.text, styles.textOnline]}>
          📡 Онлайн + офлайн · {localCount} локальних · {onlineCount} з мережі
        </Text>
      </View>
    );
  }

  if (isOffline && localCount > 0) {
    return (
      <View style={[containerStyle, styles.offline]}>
        <Text style={styles.text}>
          📴 Офлайн · {localCount} місць з локальної бази (без інтернету)
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 88,
    left: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 15,
  },
  inline: {
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  offline: {
    backgroundColor: "rgba(69, 10, 10, 0.92)",
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },
  online: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderWidth: 1,
    borderColor: "#334155",
  },
  text: {
    color: "#fecaca",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  textOnline: {
    color: "#cbd5e1",
  },
});
