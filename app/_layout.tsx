import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#0f172a" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "AVTOGID",
            headerRight: () => (
              <Pressable onPress={() => router.push("/about")} hitSlop={8}>
                <Text style={{ color: "#60a5fa", fontSize: 14, fontWeight: "600" }}>ℹ️</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="place/[id]" options={{ title: "Деталі" }} />
        <Stack.Screen name="about" options={{ title: "Про додаток" }} />
      </Stack>
    </>
  );
}
