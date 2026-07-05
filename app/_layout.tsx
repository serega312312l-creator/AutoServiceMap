import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { requestNotificationPermission } from "@/services/notificationService";

function HeaderButtons() {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <Pressable onPress={() => router.push("/my-places")} hitSlop={8}>
        <Text style={{ fontSize: 16 }}>⭐</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/stress")} hitSlop={8}>
        <Text style={{ fontSize: 16 }}>⚡</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/breakdown")} hitSlop={8}>
        <Text style={{ fontSize: 16 }}>🆘</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/settings")} hitSlop={8}>
        <Text style={{ color: "#60a5fa", fontSize: 14, fontWeight: "600" }}>⚙️</Text>
      </Pressable>
    </View>
  );
}

function ThemedStack() {
  const { theme, mode } = useTheme();

  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "AVTOGID", headerRight: () => <HeaderButtons /> }} />
        <Stack.Screen name="breakdown" options={{ title: "Поломка" }} />
        <Stack.Screen name="stress" options={{ title: "Режим стресу" }} />
        <Stack.Screen name="plan-route" options={{ title: "Мій маршрут" }} />
        <Stack.Screen name="my-places" options={{ title: "Мої місця" }} />
        <Stack.Screen name="auth" options={{ title: "Акаунт" }} />
        <Stack.Screen name="place/[id]" options={{ title: "Деталі" }} />
        <Stack.Screen name="about" options={{ title: "Про додаток" }} />
        <Stack.Screen name="settings" options={{ title: "Налаштування" }} />
        <Stack.Screen name="premium" options={{ title: "Premium" }} />
        <Stack.Screen name="garage" options={{ title: "Гараж" }} />
        <Stack.Screen name="sos" options={{ title: "SOS" }} />
        <Stack.Screen name="reminders" options={{ title: "Нагадування ТО" }} />
        <Stack.Screen name="history" options={{ title: "Історія" }} />
        <Stack.Screen name="offline-maps" options={{ title: "Офлайн-карти" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedStack />
      </ThemeProvider>
    </AuthProvider>
  );
}
