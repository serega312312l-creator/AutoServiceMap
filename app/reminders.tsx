import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { REMINDER_TYPE_LABELS, ReminderType } from "@/types/reminder";
import { useReminders } from "@/hooks/useReminders";
import { usePremium } from "@/hooks/usePremium";
import { PremiumGate } from "@/components/PremiumGate";

export default function RemindersScreen() {
  const { isPremium } = usePremium();
  const { reminders, due, add, toggle, remove } = useReminders();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<ReminderType>("oil");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await add({
      type,
      title: title.trim(),
      dueDate: date || undefined,
      notifyDaysBefore: 7,
    });
    setTitle("");
    setDate("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="Нагадування ТО">
        {due.length > 0 ? (
          <View style={styles.dueBox}>
            <Text style={styles.dueTitle}>⚠️ Потребують уваги</Text>
            {due.map((r) => (
              <Text key={r.id} style={styles.dueItem}>• {r.title}</Text>
            ))}
          </View>
        ) : null}

        {reminders.map((r) => (
          <Pressable key={r.id} style={styles.card} onPress={() => toggle(r.id)}>
            <Text style={styles.cardTitle}>
              {r.completed ? "✅" : "⬜"} {r.title}
            </Text>
            <Text style={styles.cardMeta}>
              {REMINDER_TYPE_LABELS[r.type]}
              {r.dueDate ? ` · до ${r.dueDate}` : ""}
              {r.dueMileageKm ? ` · ${r.dueMileageKm} км` : ""}
            </Text>
            <Pressable onPress={() => remove(r.id)} hitSlop={8}>
              <Text style={styles.delete}>Видалити</Text>
            </Pressable>
          </Pressable>
        ))}

        <Text style={styles.formTitle}>Нове нагадування</Text>
        <View style={styles.chips}>
          {(Object.keys(REMINDER_TYPE_LABELS) as ReminderType[]).map((t) => (
            <Pressable key={t} style={[styles.chip, type === t && styles.chipOn]} onPress={() => setType(t)}>
              <Text style={[styles.chipText, type === t && styles.chipTextOn]}>{REMINDER_TYPE_LABELS[t]}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput style={styles.input} placeholder="Назва" placeholderTextColor="#64748b" value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder="Дата (РРРР-ММ-ДД)" placeholderTextColor="#64748b" value={date} onChangeText={setDate} />
        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addText}>Додати</Text>
        </Pressable>
      </PremiumGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  dueBox: { backgroundColor: "#422006", padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#fbbf24" },
  dueTitle: { color: "#fcd34d", fontWeight: "800", marginBottom: 6 },
  dueItem: { color: "#fde68a", marginBottom: 2 },
  card: { backgroundColor: "#1e293b", padding: 14, borderRadius: 12, marginBottom: 8 },
  cardTitle: { color: "#f8fafc", fontWeight: "700" },
  cardMeta: { color: "#64748b", fontSize: 12, marginTop: 4 },
  delete: { color: "#f87171", fontSize: 12, marginTop: 8 },
  formTitle: { color: "#f8fafc", fontWeight: "800", marginTop: 16, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  chipOn: { backgroundColor: "#1e3a8a", borderColor: "#60a5fa" },
  chipText: { color: "#94a3b8", fontSize: 11 },
  chipTextOn: { color: "#fff" },
  input: { backgroundColor: "#1e293b", borderRadius: 10, padding: 12, color: "#f8fafc", marginBottom: 8 },
  addBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "800" },
});
