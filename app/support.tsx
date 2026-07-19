import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { FAQ_ITEMS, PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from "@/constants/support";

export default function SupportScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Підтримка</Text>
      <Text style={styles.sub}>
        Відповіді на часті питання та контакт для звернень. Пишіть українською — відповімо якомога
        швидше.
      </Text>

      <Pressable
        style={styles.contactBtn}
        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AVTOGID%20підтримка`)}
      >
        <Text style={styles.contactBtnText}>📧 Написати в підтримку</Text>
        <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Часті питання (FAQ)</Text>
      {FAQ_ITEMS.map((item, index) => {
        const open = openIndex === index;
        return (
          <View key={item.q} style={styles.faqCard}>
            <Pressable
              style={styles.faqHeader}
              onPress={() => setOpenIndex(open ? null : index)}
            >
              <Text style={styles.faqQ}>{item.q}</Text>
              <Text style={styles.faqChevron}>{open ? "▾" : "›"}</Text>
            </Pressable>
            {open ? <Text style={styles.faqA}>{item.a}</Text> : null}
          </View>
        );
      })}

      <Pressable style={styles.linkRow} onPress={() => Linking.openURL(PRIVACY_URL)}>
        <Text style={styles.link}>🔒 Політика конфіденційності</Text>
      </Pressable>

      <Pressable style={styles.linkRow} onPress={() => Linking.openURL(TERMS_URL)}>
        <Text style={styles.link}>📄 Умови використання</Text>
      </Pressable>

      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Назад</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  sub: { color: "#94a3b8", marginTop: 8, marginBottom: 16, lineHeight: 20 },
  contactBtn: {
    backgroundColor: "#1e3a5f",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  contactBtnText: { color: "#f8fafc", fontWeight: "800", fontSize: 16 },
  contactEmail: { color: "#93c5fd", marginTop: 6, fontSize: 14 },
  sectionTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 16, marginBottom: 10 },
  faqCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  faqQ: { flex: 1, color: "#f8fafc", fontWeight: "700", lineHeight: 20 },
  faqChevron: { color: "#64748b", fontSize: 18 },
  faqA: {
    color: "#cbd5e1",
    paddingHorizontal: 14,
    paddingBottom: 14,
    lineHeight: 20,
    fontSize: 14,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 12,
  },
  linkRow: { marginTop: 16, padding: 12 },
  link: { color: "#60a5fa", fontWeight: "700" },
  back: { marginTop: 12, alignItems: "center", padding: 12 },
  backText: { color: "#60a5fa", fontWeight: "700" },
});
