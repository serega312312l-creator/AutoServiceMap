import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSos } from "@/hooks/useSos";
import { usePremium } from "@/hooks/usePremium";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useHistory } from "@/hooks/useHistory";
import { PremiumGate } from "@/components/PremiumGate";
import { ShareLocationButton } from "@/components/ShareLocationButton";

export default function SosScreen() {
  const { isPremium } = usePremium();
  const { contacts, timer, saveContact, deleteContact, sendSos, startTimer, stopTimer } = useSos();
  const { location } = useUserLocation();
  const { logSos, logShare } = useHistory();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSos = async () => {
    if (!location) return;
    await sendSos(location.latitude, location.longitude);
    await logSos("SOS надіслано контактам");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="SOS для близьких">
        <Text style={styles.hint}>
          До 3 контактів отримають SMS з вашими координатами. Екстрені 112 — завжди безкоштовно.
        </Text>

        {location ? (
          <>
            <Pressable style={styles.sosBtn} onPress={handleSos}>
              <Text style={styles.sosText}>🆘 НАДІСЛАТИ SOS</Text>
            </Pressable>
            <ShareLocationButton
              latitude={location.latitude}
              longitude={location.longitude}
              onShared={() => logShare(location.latitude, location.longitude)}
              large
            />
          </>
        ) : null}

        <View style={styles.timerSection}>
          <Text style={styles.sectionTitle}>⏱ Таймер безпеки</Text>
          <Text style={styles.timerDesc}>
            Якщо не підтвердите за 30 хв — SOS надішлеться автоматично.
          </Text>
          {timer.active ? (
            <Pressable style={styles.stopBtn} onPress={stopTimer}>
              <Text style={styles.stopText}>Зупинити таймер</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.startBtn} onPress={() => startTimer(30)}>
              <Text style={styles.startText}>Запустити 30 хв</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Контакти ({contacts.length}/3)</Text>
        {contacts.map((c) => (
          <View key={c.id} style={styles.contact}>
            <Text style={styles.contactName}>{c.name}</Text>
            <Text style={styles.contactPhone}>{c.phone}</Text>
            <Pressable onPress={() => deleteContact(c.id)}>
              <Text>🗑</Text>
            </Pressable>
          </View>
        ))}

        {contacts.length < 3 ? (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Ім'я" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Телефон" placeholderTextColor="#64748b" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Pressable
              style={styles.addBtn}
              onPress={async () => {
                if (!name.trim() || !phone.trim()) return;
                await saveContact({ name: name.trim(), phone: phone.trim() });
                setName("");
                setPhone("");
              }}
            >
              <Text style={styles.addText}>Додати контакт</Text>
            </Pressable>
          </View>
        ) : null}
      </PremiumGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: "#94a3b8", lineHeight: 20, marginBottom: 16 },
  sosBtn: { backgroundColor: "#dc2626", padding: 20, borderRadius: 14, alignItems: "center", marginBottom: 10, borderWidth: 2, borderColor: "#fca5a5" },
  sosText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  timerSection: { backgroundColor: "#1e293b", padding: 14, borderRadius: 12, marginVertical: 16 },
  sectionTitle: { color: "#f8fafc", fontWeight: "800", marginBottom: 8, marginTop: 8 },
  timerDesc: { color: "#94a3b8", fontSize: 13, marginBottom: 10 },
  startBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 10, alignItems: "center" },
  startText: { color: "#fff", fontWeight: "700" },
  stopBtn: { backgroundColor: "#7f1d1d", padding: 12, borderRadius: 10, alignItems: "center" },
  stopText: { color: "#fecaca", fontWeight: "700" },
  contact: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  contactName: { color: "#f8fafc", fontWeight: "700", flex: 1 },
  contactPhone: { color: "#60a5fa" },
  form: { marginTop: 12 },
  input: { backgroundColor: "#1e293b", borderRadius: 10, padding: 12, color: "#f8fafc", marginBottom: 8 },
  addBtn: { backgroundColor: "#334155", padding: 12, borderRadius: 10, alignItems: "center" },
  addText: { color: "#f8fafc", fontWeight: "700" },
});
