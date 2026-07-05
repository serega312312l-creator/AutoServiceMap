import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { INSURANCE_CHECKLIST } from "@/constants/insurance";

export function InsuranceChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const done = Object.values(checked).filter(Boolean).length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>📋 Чекліст після ДТП ({done}/{INSURANCE_CHECKLIST.length})</Text>
      {INSURANCE_CHECKLIST.map((item) => (
        <Pressable key={item.id} style={styles.row} onPress={() => toggle(item.id)}>
          <Text style={styles.box}>{checked[item.id] ? "✅" : "⬜"}</Text>
          <Text style={[styles.label, checked[item.id] && styles.labelDone]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#172554",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#1e40af",
  },
  title: { color: "#93c5fd", fontWeight: "800", marginBottom: 10, fontSize: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6 },
  box: { fontSize: 16 },
  label: { color: "#e2e8f0", flex: 1, lineHeight: 20, fontSize: 14 },
  labelDone: { color: "#64748b", textDecorationLine: "line-through" },
});
