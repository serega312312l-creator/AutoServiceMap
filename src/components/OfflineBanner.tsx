import { StyleSheet, Text, View } from "react-native";

interface OfflineBannerProps {
  isOffline: boolean;
  localCount: number;
  onlineCount: number;
  variant?: "overlay" | "inline" | "compact";
}

export function OfflineBanner({
  isOffline,
  localCount,
  onlineCount,
  variant = "overlay",
}: OfflineBannerProps) {
  if (variant === "compact") {
    if (!isOffline && onlineCount > 0) {
      return (
        <View style={styles.compactOnline}>
          <Text style={styles.compactTextOnline} numberOfLines={1}>
            📡 Онлайн · {localCount}+{onlineCount}
          </Text>
        </View>
      );
    }
    if (isOffline && localCount > 0) {
      return (
        <View style={styles.compactOffline}>
          <Text style={styles.compactTextOffline} numberOfLines={1}>
            📴 Офлайн · {localCount} місць
          </Text>
        </View>
      );
    }
    return null;
  }

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
    bottom: 140,
    left: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 12,
  },
  inline: {
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  compactOffline: {
    backgroundColor: "rgba(69, 10, 10, 0.92)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    alignSelf: "flex-start",
  },
  compactOnline: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#334155",
    alignSelf: "flex-start",
  },
  compactTextOffline: {
    color: "#fecaca",
    fontSize: 10,
    fontWeight: "700",
  },
  compactTextOnline: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
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
