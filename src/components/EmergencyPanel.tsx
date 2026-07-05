import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EMERGENCY_CONTACTS } from "@/constants/emergency";
import { callEmergency } from "@/utils/navigation";

export function EmergencyPanel() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>🆘 Екстрено</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {EMERGENCY_CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.button}
            onPress={() => callEmergency(contact.number)}
          >
            <Text style={styles.emoji}>{contact.emoji}</Text>
            <Text style={styles.label}>{contact.label}</Text>
            <Text style={styles.number}>{contact.number}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 4,
    paddingBottom: 6,
  },
  title: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },
  button: {
    minWidth: 72,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#450a0a",
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },
  emoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  label: {
    color: "#fecaca",
    fontSize: 11,
    fontWeight: "700",
  },
  number: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
});
