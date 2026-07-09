import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { EmergencyPanel } from "@/components/EmergencyPanel";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MAX_COVERAGE_RADIUS_METERS } from "@/constants/categories";
import { findNearestByCategory } from "@/services/placesAggregator";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";
import { callEmergency, callPhone } from "@/utils/navigation";

export default function StressModeScreen() {
  const { location, loading } = useUserLocation();
  const { places } = useNearbyPlaces(location, { radiusMeters: MAX_COVERAGE_RADIUS_METERS });

  const nearestTow = findNearestByCategory(places, "towing");
  const nearestSto = findNearestByCategory(places, "sto");

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f87171" size="large" />
        <Text style={styles.loading}>Визначаємо GPS...</Text>
      </View>
    );
  }

  const goRoute = (place: Place) => {
    router.navigate({ pathname: "/", params: { buildRoute: JSON.stringify(place) } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Режим стресу</Text>
      <Text style={styles.sub}>Великі кнопки — мінімум відволікань</Text>

      <Pressable style={styles.btn112} onPress={() => callEmergency("112")}>
        <Text style={styles.btnEmoji}>🚨</Text>
        <Text style={styles.btnTitle}>112</Text>
        <Text style={styles.btnSub}>Екстрені служби</Text>
      </Pressable>

      <BigServiceBtn
        emoji="🛻"
        title="Евакуатор"
        place={nearestTow}
        onRoute={goRoute}
        onCall={nearestTow?.phone ? () => callPhone(nearestTow.phone!) : undefined}
      />

      <BigServiceBtn
        emoji="🔧"
        title="Найближче СТО"
        place={nearestSto}
        onRoute={goRoute}
        onCall={nearestSto?.phone ? () => callPhone(nearestSto.phone!) : undefined}
      />

      <EmergencyPanel />

      <Pressable style={styles.mapLink} onPress={() => router.push("/")}>
        <Text style={styles.mapLinkText}>🗺 Повна карта</Text>
      </Pressable>
    </ScrollView>
  );
}

function BigServiceBtn({
  emoji,
  title,
  place,
  onRoute,
  onCall,
}: {
  emoji: string;
  title: string;
  place: Place | null;
  onRoute: (p: Place) => void;
  onCall?: () => void;
}) {
  return (
    <View style={styles.serviceBox}>
      <Text style={styles.serviceEmoji}>{emoji}</Text>
      <Text style={styles.serviceTitle}>{title}</Text>
      {place ? (
        <>
          <Text style={styles.serviceName} numberOfLines={2}>{place.name}</Text>
          <Text style={styles.serviceDist}>{formatDistance(place.distanceMeters)}</Text>
          <View style={styles.serviceActions}>
            <Pressable style={styles.routeBtn} onPress={() => onRoute(place)}>
              <Text style={styles.routeBtnText}>Маршрут</Text>
            </Pressable>
            {onCall ? (
              <Pressable style={styles.callBtn} onPress={onCall}>
                <Text style={styles.callBtnText}>📞 Дзвінок</Text>
              </Pressable>
            ) : null}
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Не знайдено в радіусі 100 км</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  loading: { color: "#94a3b8", marginTop: 12 },
  title: { color: "#f87171", fontSize: 26, fontWeight: "900", textAlign: "center" },
  sub: { color: "#94a3b8", textAlign: "center", marginBottom: 20 },
  btn112: {
    backgroundColor: "#7f1d1d",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fca5a5",
  },
  btnEmoji: { fontSize: 40 },
  btnTitle: { color: "#fff", fontSize: 36, fontWeight: "900" },
  btnSub: { color: "#fecaca", marginTop: 4 },
  serviceBox: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  serviceEmoji: { fontSize: 44 },
  serviceTitle: { color: "#93c5fd", fontWeight: "800", fontSize: 14, marginTop: 8 },
  serviceName: { color: "#f8fafc", fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 8 },
  serviceDist: { color: "#60a5fa", fontSize: 18, fontWeight: "700", marginTop: 6 },
  serviceActions: { flexDirection: "row", gap: 10, marginTop: 16, width: "100%" },
  routeBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  routeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  callBtn: {
    flex: 1,
    backgroundColor: "#14532d",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  callBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  empty: { color: "#64748b", marginTop: 8 },
  mapLink: { marginTop: 12, padding: 14, alignItems: "center" },
  mapLinkText: { color: "#60a5fa", fontWeight: "700" },
});
