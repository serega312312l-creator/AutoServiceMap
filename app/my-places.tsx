import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { usePlaceLists } from "@/hooks/usePlaceLists";
import { useAuth } from "@/hooks/useAuth";
import { PLACE_TAG_LABELS, PlaceTag } from "@/types/user";
import { Place } from "@/types/place";
import { formatDistance } from "@/services/locationService";
import { sharePlace } from "@/utils/sharePlace";

const TAGS: PlaceTag[] = ["my_sto", "tow", "fuel", "azs", "other"];

export default function MyPlacesScreen() {
  const { favorites, lists, createList, deleteList, removeFavorite, setTag, reload } =
    usePlaceLists();
  const { user, sync, cloudAvailable } = useAuth();
  const [newListName, setNewListName] = useState("");
  const [tab, setTab] = useState<"favorites" | "lists">("favorites");

  const openPlace = (place: Place) => {
    router.push({
      pathname: "/place/[id]",
      params: { id: place.id, data: JSON.stringify(place) },
    });
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName);
    setNewListName("");
  };

  const handleSync = async () => {
    await sync();
    await reload();
    Alert.alert("Синхронізація", "Дані оновлено");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Мої місця</Text>
          <Text style={styles.sub}>
            {user?.isGuest ? "Локально на пристрої" : user?.email ?? "Гість"}
          </Text>
        </View>
        {cloudAvailable && !user?.isGuest ? (
          <Pressable style={styles.syncBtn} onPress={handleSync}>
            <Text style={styles.syncText}>☁️ Синхр.</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.syncBtn} onPress={() => router.push("/auth")}>
            <Text style={styles.syncText}>Увійти</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "favorites" && styles.tabOn]}
          onPress={() => setTab("favorites")}
        >
          <Text style={styles.tabText}>⭐ Обране ({favorites.length})</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "lists" && styles.tabOn]}
          onPress={() => setTab("lists")}
        >
          <Text style={styles.tabText}>📋 Списки ({lists.length})</Text>
        </Pressable>
      </View>

      {tab === "favorites" ? (
        favorites.length === 0 ? (
          <Text style={styles.empty}>Натисніть ⭐ на карті або в деталях місця</Text>
        ) : (
          favorites.map((entry) => (
            <View key={entry.place.id} style={styles.card}>
              <Pressable onPress={() => openPlace(entry.place)}>
                <Text style={styles.cardTitle}>{entry.place.name}</Text>
                {entry.place.distanceMeters != null ? (
                  <Text style={styles.cardMeta}>{formatDistance(entry.place.distanceMeters)}</Text>
                ) : null}
              </Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
                {TAGS.map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.tag, entry.tag === t && styles.tagOn]}
                    onPress={() => setTag(entry.place.id, t)}
                  >
                    <Text style={styles.tagText}>{PLACE_TAG_LABELS[t]}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={() => sharePlace(entry.place)}>
                  <Text style={styles.actionText}>📤</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() =>
                    router.navigate({
                      pathname: "/",
                      params: { buildRoute: JSON.stringify(entry.place) },
                    })
                  }
                >
                  <Text style={styles.actionText}>🗺</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => removeFavorite(entry.place.id)}
                >
                  <Text style={styles.actionText}>🗑</Text>
                </Pressable>
              </View>
            </View>
          ))
        )
      ) : (
        <>
          <View style={styles.newListRow}>
            <TextInput
              style={styles.listInput}
              placeholder="Назва списку (маршрут, подорож…)"
              placeholderTextColor="#64748b"
              value={newListName}
              onChangeText={setNewListName}
            />
            <Pressable style={styles.addListBtn} onPress={handleCreateList}>
              <Text style={styles.addListText}>+</Text>
            </Pressable>
          </View>
          {lists.length === 0 ? (
            <Text style={styles.empty}>Створіть список для зупинок по дорозі</Text>
          ) : (
            lists.map((list) => (
              <View key={list.id} style={styles.card}>
                <View style={styles.listHeader}>
                  <Text style={styles.cardTitle}>{list.name}</Text>
                  <Pressable onPress={() => deleteList(list.id)}>
                    <Text style={styles.deleteText}>Видалити</Text>
                  </Pressable>
                </View>
                <Text style={styles.cardMeta}>{list.places.length} місць</Text>
                {list.places.map((p) => (
                  <Pressable key={p.id} style={styles.listItem} onPress={() => openPlace(p)}>
                    <Text style={styles.listItemText}>• {p.name}</Text>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  sub: { color: "#64748b", marginTop: 4, fontSize: 12 },
  syncBtn: { backgroundColor: "#1e293b", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  syncText: { color: "#60a5fa", fontWeight: "700", fontSize: 12 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#1e293b", alignItems: "center" },
  tabOn: { backgroundColor: "#2563eb" },
  tabText: { color: "#f8fafc", fontWeight: "700", fontSize: 12 },
  empty: { color: "#64748b", textAlign: "center", marginTop: 32 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 16 },
  cardMeta: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  tagRow: { marginTop: 10 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tagOn: { backgroundColor: "#7c3aed", borderColor: "#a78bfa" },
  tagText: { color: "#cbd5e1", fontSize: 11, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: { fontSize: 16 },
  newListRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  listInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  addListBtn: {
    width: 44,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addListText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  deleteText: { color: "#f87171", fontSize: 12, fontWeight: "600" },
  listItem: { paddingVertical: 6 },
  listItemText: { color: "#cbd5e1" },
});
