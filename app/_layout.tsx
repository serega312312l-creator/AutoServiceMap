import { Stack, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

function HeaderButtons() {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
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
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
