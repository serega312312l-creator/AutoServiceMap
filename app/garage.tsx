import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FuelType, TransmissionType, FUEL_LABELS, TRANSMISSION_LABELS } from "@/types/car";
import { useCarProfiles } from "@/hooks/useCarProfiles";
import { usePremium } from "@/hooks/usePremium";
import { PremiumGate } from "@/components/PremiumGate";

export default function GarageScreen() {
  const { isPremium } = usePremium();
  const { cars, activeCar, addOrUpdate, remove, selectActive, updateMileage } = useCarProfiles();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuel, setFuel] = useState<FuelType>("petrol");
  const [trans, setTrans] = useState<TransmissionType>("manual");
  const [mileage, setMileage] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addOrUpdate({
      name: name.trim(),
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      fuelType: fuel,
      transmission: trans,
      isElectric: fuel === "electric" || fuel === "hybrid",
      isDiesel: fuel === "diesel",
      mileageKm: mileage ? parseInt(mileage, 10) : undefined,
    });
    setName("");
    setBrand("");
    setModel("");
    setMileage("");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PremiumGate isPremium={isPremium} feature="Гараж — кілька авто">
        <Text style={styles.hint}>
          Додаток підбере СТО, АЗС та зарядки під ваше авто.
        </Text>

        {cars.map((car) => (
          <View key={car.id} style={[styles.card, activeCar?.id === car.id && styles.cardActive]}>
            <Pressable onPress={() => selectActive(car.id)}>
              <Text style={styles.carName}>
                {activeCar?.id === car.id ? "✓ " : ""}{car.name}
              </Text>
              <Text style={styles.carMeta}>
                {car.brand} {car.model} · {FUEL_LABELS[car.fuelType]} · {TRANSMISSION_LABELS[car.transmission]}
              </Text>
              {car.mileageKm != null ? (
                <Text style={styles.mileage}>{car.mileageKm.toLocaleString()} км</Text>
              ) : null}
            </Pressable>
            <View style={styles.cardActions}>
              <TextInput
                style={styles.mileageInput}
                placeholder="Пробіг км"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                onSubmitEditing={(e) => {
                  const km = parseInt(e.nativeEvent.text, 10);
                  if (km > 0) updateMileage(car.id, km);
                }}
              />
              <Pressable onPress={() => remove(car.id)}>
                <Text style={styles.delete}>🗑</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.formTitle}>Додати авто</Text>
        <TextInput style={styles.input} placeholder="Назва (Моя Toyota)" placeholderTextColor="#64748b" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Марка" placeholderTextColor="#64748b" value={brand} onChangeText={setBrand} />
        <TextInput style={styles.input} placeholder="Модель" placeholderTextColor="#64748b" value={model} onChangeText={setModel} />
        <TextInput style={styles.input} placeholder="Пробіг (км)" placeholderTextColor="#64748b" value={mileage} onChangeText={setMileage} keyboardType="numeric" />

        <Text style={styles.label}>Пальне</Text>
        <View style={styles.chips}>
          {(Object.keys(FUEL_LABELS) as FuelType[]).map((f) => (
            <Pressable key={f} style={[styles.chip, fuel === f && styles.chipOn]} onPress={() => setFuel(f)}>
              <Text style={[styles.chipText, fuel === f && styles.chipTextOn]}>{FUEL_LABELS[f]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Коробка</Text>
        <View style={styles.chips}>
          {(Object.keys(TRANSMISSION_LABELS) as TransmissionType[]).map((t) => (
            <Pressable key={t} style={[styles.chip, trans === t && styles.chipOn]} onPress={() => setTrans(t)}>
              <Text style={[styles.chipText, trans === t && styles.chipTextOn]}>{TRANSMISSION_LABELS[t]}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Зберегти авто</Text>
        </Pressable>
      </PremiumGate>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  hint: { color: "#94a3b8", marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#334155" },
  cardActive: { borderColor: "#60a5fa" },
  carName: { color: "#f8fafc", fontWeight: "800", fontSize: 16 },
  carMeta: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  mileage: { color: "#60a5fa", marginTop: 4, fontWeight: "600" },
  cardActions: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  mileageInput: { flex: 1, backgroundColor: "#0f172a", borderRadius: 8, padding: 8, color: "#f8fafc", fontSize: 13 },
  delete: { fontSize: 20 },
  formTitle: { color: "#f8fafc", fontWeight: "800", marginTop: 16, marginBottom: 10 },
  input: { backgroundColor: "#1e293b", borderRadius: 10, padding: 12, color: "#f8fafc", marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  label: { color: "#94a3b8", fontWeight: "700", marginTop: 8, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  chipOn: { backgroundColor: "#1e3a8a", borderColor: "#60a5fa" },
  chipText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  chipTextOn: { color: "#fff" },
  addBtn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  addBtnText: { color: "#fff", fontWeight: "800" },
});
