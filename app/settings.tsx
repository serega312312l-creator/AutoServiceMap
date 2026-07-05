import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { usePremium } from "@/hooks/usePremium";
import { useTheme } from "@/hooks/useTheme";
import { useReminders } from "@/hooks/useReminders";
import { useDatabaseUpdate } from "@/hooks/useDatabaseUpdate";
import { useUserLocation } from "@/hooks/useUserLocation";
import { isNightMapEnabled, setNightMapEnabled } from "@/services/mapPreferencesService";

const MENU = [
  { route: "/premium", icon: "👑", title: "Premium", subtitle: "Підписка та пробний період" },
  { route: "/garage", icon: "🚗", title: "Гараж", subtitle: "Ваші авто", premium: true },
  { route: "/sos", icon: "🆘", title: "SOS сім'ї", subtitle: "Контакти та таймер безпеки", premium: true },
  { route: "/reminders", icon: "🔔", title: "Нагадування ТО", subtitle: "Масло, шини, техогляд", premium: true },
  { route: "/history", icon: "📋", title: "Історія", subtitle: "Візити, маршрути, поломки", premium: true },
  { route: "/offline-maps", icon: "🗺️", title: "Офлайн-карти", subtitle: "Завантажити регіон", premium: true },
  { route: "/plan-route", icon: "🛣️", title: "Мій маршрут", subtitle: "Планування + мертві зони" },
  { route: "/stress", icon: "⚡", title: "Режим стресу", subtitle: "112, евакуатор, СТО — великі кнопки" },
  { route: "/breakdown", icon: "🚨", title: "Поломка", subtitle: "112, евакуатор, СТО — безкоштовно" },
  { route: "/about", icon: "ℹ️", title: "Про додаток", subtitle: "Довідка та конфіденційність" },
] as const;

export default function SettingsScreen() {
  const { isPremium, label } = usePremium();
  const { mode, toggleTheme } = useTheme();
  const { due } = useReminders();
  const { location } = useUserLocation();
  const { status: dbStatus, runUpdate } = useDatabaseUpdate(location);
  const [nightMap, setNightMap] = useState(true);

  useEffect(() => {
    isNightMapEnabled().then(setNightMap);
  }, []);

  const toggleNightMap = async () => {
    const next = !nightMap;
    setNightMap(next);
    await setNightMapEnabled(next);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "ще не оновлювалась";
    return new Date(iso).toLocaleString("uk-UA");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Налаштування</Text>
        <Text style={styles.headerSub}>Статус: {label}</Text>
      </View>

      {due.length > 0 ? (
        <Pressable style={styles.alert} onPress={() => router.push("/reminders")}>
          <Text style={styles.alertText}>🔔 {due.length} нагадувань ТО потребують уваги</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.themeRow} onPress={toggleTheme}>
        <Text style={styles.themeText}>{mode === "dark" ? "🌙 Темна тема" : "☀️ Світла тема"}</Text>
        <Text style={styles.themeToggle}>Змінити</Text>
      </Pressable>

      <Pressable style={styles.themeRow} onPress={toggleNightMap}>
        <Text style={styles.themeText}>{nightMap ? "🌃 Нічна карта" : "🗺 Звичайна карта"}</Text>
        <Text style={styles.themeToggle}>{nightMap ? "Увімкнено" : "Вимкнено"}</Text>
      </Pressable>

      <View style={styles.dbBox}>
        <Text style={styles.dbTitle}>🗄 База СТО (автооновлення)</Text>
        <Text style={styles.dbMeta}>
          На пристрої: {dbStatus?.localCount ?? 0} місць · у додатку: {dbStatus?.bundledCount ?? 0}
        </Text>
        <Text style={styles.dbMeta}>Останнє оновлення: {formatDate(dbStatus?.lastUpdateAt ?? null)}</Text>
        {dbStatus?.message ? <Text style={styles.dbMsg}>{dbStatus.message}</Text> : null}
        {dbStatus?.error ? <Text style={styles.dbErr}>{dbStatus.error}</Text> : null}
        <Pressable
          style={styles.dbBtn}
          onPress={() => runUpdate(true)}
          disabled={dbStatus?.downloading}
        >
          {dbStatus?.downloading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.dbBtnText}>Оновити базу зараз</Text>
          )}
        </Pressable>
        <Text style={styles.dbHint}>
          Перевірка автоматично раз на 24 год при інтернеті. Спочатку — ваш регіон.
        </Text>
      </View>

      {MENU.map((item) => {
        if ("premium" in item && item.premium && !isPremium) {
          return (
            <Pressable
              key={item.route}
              style={[styles.row, styles.rowLocked]}
              onPress={() => router.push("/premium")}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title} 👑</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={item.route}
            style={styles.row}
            onPress={() => router.push(item.route as "/premium")}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSub}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  headerSub: { color: "#94a3b8", marginTop: 4 },
  alert: {
    backgroundColor: "#422006",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  alertText: { color: "#fcd34d", fontWeight: "700" },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeText: { color: "#f8fafc", fontWeight: "700" },
  themeToggle: { color: "#60a5fa", fontWeight: "600" },
  dbBox: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dbTitle: { color: "#f8fafc", fontWeight: "800", marginBottom: 6 },
  dbMeta: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  dbMsg: { color: "#93c5fd", fontSize: 12, marginTop: 4 },
  dbErr: { color: "#f87171", fontSize: 12, marginTop: 4 },
  dbBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  dbBtnText: { color: "#fff", fontWeight: "700" },
  dbHint: { color: "#64748b", fontSize: 11, marginTop: 8, lineHeight: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  rowLocked: { opacity: 0.85, borderWidth: 1, borderColor: "#fbbf24" },
  icon: { fontSize: 24 },
  rowText: { flex: 1 },
  rowTitle: { color: "#f8fafc", fontWeight: "700", fontSize: 16 },
  rowSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  chevron: { color: "#64748b", fontSize: 22 },
});
