import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  formatCoordinates,
  formatCoordinatesDms,
  formatPhoneForDial,
  getGoogleMapsUrl,
} from "@/utils/placeFormat";
import { callPhone } from "@/utils/navigation";
import { submitUserPhone, getPlaceComments, addPlaceComment } from "@/services/placeUserDataService";
import { deletePlacePhoto, getPlacePhotoUri, savePlacePhoto } from "@/services/placePhotoService";
interface PlacePhoneBlockProps {
  placeId: string;
  phones: string[];
  onPhoneAdded: (phone: string) => void;
  onCall?: () => void;
}

export function PlacePhoneBlock({ placeId, phones, onPhoneAdded, onCall }: PlacePhoneBlockProps) {
  const [input, setInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async () => {
    const saved = await submitUserPhone(placeId, input);
    if (!saved) {
      Alert.alert("Помилка", "Введіть коректний номер, наприклад: 050 123 4567");
      return;
    }
    onPhoneAdded(saved);
    setInput("");
    setShowAdd(false);
    Alert.alert("Збережено", "Номер додано. Дякуємо!");
  };

  if (phones.length === 0 && !showAdd) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Телефон</Text>
        <Text style={styles.missing}>Номер не вказано в базі</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Додати номер (якщо знаєте)</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Телефон</Text>
      {phones.map((phone) => (
        <Pressable
          key={phone}
          style={styles.phoneRow}
          onPress={() => {
            callPhone(formatPhoneForDial(phone));
            onCall?.();
          }}
        >
          <Text style={styles.phoneIcon}>📞</Text>
          <Text style={styles.phoneText}>{phone}</Text>
        </Pressable>
      ))}
      {!showAdd ? (
        <Pressable onPress={() => setShowAdd(true)}>
          <Text style={styles.addLink}>+ Додати інший номер</Text>
        </Pressable>
      ) : (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="050 123 4567"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            value={input}
            onChangeText={setInput}
          />
          <Pressable style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Зберегти</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

interface PlaceCoordinatesBlockProps {
  latitude: number;
  longitude: number;
}

export function PlaceCoordinatesBlock({ latitude, longitude }: PlaceCoordinatesBlockProps) {
  const decimal = formatCoordinates(latitude, longitude);
  const dms = formatCoordinatesDms(latitude, longitude);
  const mapsUrl = getGoogleMapsUrl(latitude, longitude);

  const copyCoords = async () => {
    await Share.share({
      message: `Координати СТО:\n${decimal}\n${mapsUrl}`,
      title: "Координати",
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Координати (якщо GPS не ловить)</Text>
      <Text style={styles.coordMain}>{decimal}</Text>
      <Text style={styles.coordSub}>{dms}</Text>
      <View style={styles.coordActions}>
        <Pressable style={styles.coordBtn} onPress={copyCoords}>
          <Text style={styles.coordBtnText}>📋 Поділитися / скопіювати</Text>
        </Pressable>
        <Pressable style={styles.coordBtnOutline} onPress={() => Share.share({ message: mapsUrl })}>
          <Text style={styles.coordBtnTextOutline}>🗺 Google Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface PlaceCommentBlockProps {
  placeId: string;
}

interface PlacePhotoBlockProps {
  placeId: string;
  placeName: string;
}

export function PlacePhotoBlock({ placeId, placeName }: PlacePhotoBlockProps) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    getPlacePhotoUri(placeId).then(setUri);
  }, [placeId]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Камера", "Дозвольте доступ до камери в налаштуваннях");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets[0]) return;
    const saved = await savePlacePhoto(placeId, result.assets[0].uri);
    setUri(saved);
    Alert.alert("Збережено", "Фото входу збережено на пристрої");
  };

  const sharePhoto = async () => {
    if (!uri) return;
    await Share.share({ message: `Вхід до ${placeName}`, url: uri });
  };

  const removePhoto = async () => {
    await deletePlacePhoto(placeId);
    setUri(null);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Фото входу (для GPS)</Text>
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
          <View style={styles.coordActions}>
            <Pressable style={styles.coordBtn} onPress={sharePhoto}>
              <Text style={styles.coordBtnText}>📤 Поділитися</Text>
            </Pressable>
            <Pressable style={styles.coordBtnOutline} onPress={removePhoto}>
              <Text style={styles.coordBtnTextOutline}>🗑 Видалити</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable style={styles.addBtn} onPress={pickPhoto}>
          <Text style={styles.addBtnText}>📷 Зробити фото входу</Text>
        </Pressable>
      )}
    </View>
  );
}

export function PlaceCommentBlock({ placeId }: PlaceCommentBlockProps) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState<{ text: string; date: string }[]>([]);

  const load = async () => {
    const list = await getPlaceComments(placeId);
    setComments(
      list.map((c) => ({
        text: c.text,
        date: new Date(c.timestamp).toLocaleDateString("uk-UA"),
      }))
    );
  };

  useEffect(() => {
    load();
  }, [placeId]);

  const save = async () => {
    if (!text.trim()) return;
    await addPlaceComment(placeId, text);
    setText("");
    await load();
    Alert.alert("Збережено", "Ваш коментар додано");
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Мій коментар</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="Напр.: працюють до 20:00, є евакуатор..."
        placeholderTextColor="#64748b"
        multiline
        value={text}
        onChangeText={setText}
      />
      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>Зберегти коментар</Text>
      </Pressable>
      {comments.map((c, i) => (
        <View key={i} style={styles.commentCard}>
          <Text style={styles.commentText}>{c.text}</Text>
          <Text style={styles.commentDate}>{c.date}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  missing: { color: "#f87171", fontSize: 14, marginBottom: 8 },
  addBtn: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  addBtnText: { color: "#60a5fa", fontWeight: "700" },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  phoneIcon: { fontSize: 18 },
  phoneText: { color: "#4ade80", fontSize: 17, fontWeight: "700" },
  addLink: { color: "#60a5fa", marginTop: 8, fontWeight: "600" },
  addForm: { marginTop: 8, gap: 8 },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  saveBtn: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#f8fafc", fontWeight: "700" },
  coordMain: { color: "#f8fafc", fontSize: 16, fontWeight: "700", fontFamily: "monospace" },
  coordSub: { color: "#64748b", fontSize: 12, marginTop: 4, marginBottom: 10 },
  coordActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  coordBtn: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  coordBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  coordBtnOutline: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    flex: 1,
    alignItems: "center",
  },
  coordBtnTextOutline: { color: "#94a3b8", fontWeight: "600", fontSize: 12 },
  commentInput: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    color: "#f8fafc",
    minHeight: 72,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 8,
  },
  commentCard: {
    backgroundColor: "#172554",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  commentText: { color: "#e2e8f0", lineHeight: 20 },
  commentDate: { color: "#64748b", fontSize: 11, marginTop: 4 },
  photo: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#1e293b",
  },
});
