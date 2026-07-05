import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { EmergencyPanel } from "@/components/EmergencyPanel";

const SUPPORT_EMAIL = "serega312312l@gmail.com";
const PRIVACY_URL = "https://sites.google.com/view/avtogid-privacy";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AVTOGID</Text>
      <Text style={styles.version}>Версія {Constants.expoConfig?.version ?? "1.0.0"}</Text>

      <Text style={styles.paragraph}>
        AVTOGID допомагає швидко знайти СТО, евакуатор, шиномонтаж або автомагазин поруч — коли
        сталася поломка, прокол колеса чи ДТП.
      </Text>

      <EmergencyPanel />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Можливості</Text>
    <Text style={styles.bullet}>• Офлайн-база СТО без інтернету (до 100 км)</Text>
    <Text style={styles.bullet}>• Екран «Поломка» — евакуатор, СТО, 112</Text>
    <Text style={styles.bullet}>• Маршрут на карті в додатку</Text>
    <Text style={styles.bullet}>• Улюблені та нещодавні місця</Text>
      </View>

      <Pressable style={styles.linkRow} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
        <Text style={styles.link}>📧 {SUPPORT_EMAIL}</Text>
      </Pressable>

      <Pressable style={styles.linkRow} onPress={() => Linking.openURL(PRIVACY_URL)}>
        <Text style={styles.link}>🔒 Політика конфіденційності</Text>
      </Pressable>

      <Text style={styles.footer}>© 2026 AVTOGID · Україна</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  version: {
    color: "#64748b",
    marginTop: 4,
    marginBottom: 16,
  },
  paragraph: {
    color: "#cbd5e1",
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  bullet: {
    color: "#94a3b8",
    lineHeight: 22,
    fontSize: 14,
  },
  linkRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  link: {
    color: "#60a5fa",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    color: "#475569",
    textAlign: "center",
    marginTop: 32,
    fontSize: 12,
  },
});
