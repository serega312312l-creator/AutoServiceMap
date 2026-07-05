import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

interface PremiumGateProps {
  isPremium: boolean;
  children: React.ReactNode;
  feature: string;
  compact?: boolean;
}

export function PremiumGate({ isPremium, children, feature, compact }: PremiumGateProps) {
  if (isPremium) return <>{children}</>;

  if (compact) {
    return (
      <Pressable style={styles.compact} onPress={() => router.push("/premium")}>
        <Text style={styles.compactText}>👑 {feature} — Premium</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.gate}>
      <Text style={styles.lock}>👑</Text>
      <Text style={styles.title}>{feature}</Text>
      <Text style={styles.desc}>Доступно в Premium. Екстрені функції залишаються безкоштовними.</Text>
      <Pressable style={styles.btn} onPress={() => router.push("/premium")}>
        <Text style={styles.btnText}>Спробувати 7 днів безкоштовно</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fbbf24",
    marginVertical: 8,
  },
  lock: { fontSize: 32, marginBottom: 8 },
  title: { color: "#fbbf24", fontWeight: "800", fontSize: 16, marginBottom: 6 },
  desc: { color: "#94a3b8", textAlign: "center", lineHeight: 20, marginBottom: 14 },
  btn: { backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  compact: {
    backgroundColor: "#172554",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  compactText: { color: "#fbbf24", fontWeight: "700", fontSize: 13, textAlign: "center" },
});
