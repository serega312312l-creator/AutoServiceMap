import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function AuthScreen() {
  const { signIn, signUp, continueAsGuest, cloudAvailable, user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && !user.isGuest) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Ви в системі</Text>
        <Text style={styles.sub}>{user.email}</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Назад</Text>
        </Pressable>
      </View>
    );
  }

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert("Помилка", "Email та пароль (мін. 6 символів)");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password, name);
      router.back();
    } catch (e) {
      Alert.alert("Помилка", e instanceof Error ? e.message : "Не вдалося");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Акаунт AVTOGID</Text>
      <Text style={styles.sub}>
        Синхронізація обраного, списків і гаража між пристроями
      </Text>

      {!cloudAvailable ? (
        <View style={styles.warn}>
          <Text style={styles.warnText}>
            Хмарна синхронізація ще не налаштована (SUPABASE_URL). Працює локальний режим.
          </Text>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, mode === "login" && styles.tabOn]}
          onPress={() => setMode("login")}
        >
          <Text style={styles.tabText}>Вхід</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, mode === "register" && styles.tabOn]}
          onPress={() => setMode("register")}
        >
          <Text style={styles.tabText}>Реєстрація</Text>
        </Pressable>
      </View>

      {mode === "register" ? (
        <TextInput
          style={styles.input}
          placeholder="Ім'я"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.btn} onPress={submit} disabled={busy || !cloudAvailable}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{mode === "login" ? "Увійти" : "Створити акаунт"}</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.guestBtn}
        onPress={async () => {
          await continueAsGuest();
          router.back();
        }}
      >
        <Text style={styles.guestText}>Продовжити без акаунта</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", padding: 24 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  sub: { color: "#94a3b8", marginTop: 8, marginBottom: 20, lineHeight: 20 },
  warn: { backgroundColor: "#422006", padding: 12, borderRadius: 10, marginBottom: 16 },
  warnText: { color: "#fcd34d", fontSize: 13 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#1e293b", alignItems: "center" },
  tabOn: { backgroundColor: "#2563eb" },
  tabText: { color: "#f8fafc", fontWeight: "700" },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 14,
    color: "#f8fafc",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
  guestBtn: { marginTop: 16, alignItems: "center", padding: 12 },
  guestText: { color: "#60a5fa", fontWeight: "600" },
});
