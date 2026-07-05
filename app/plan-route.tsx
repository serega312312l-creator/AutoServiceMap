import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { UKRAINE_REGIONS } from "@/constants/regions";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { analyzeDeadZones } from "@/services/deadZoneService";
import { findPlacesAlongRoute } from "@/services/alongRouteService";
import { fetchDrivingRoute, formatRouteDuration } from "@/services/routeService";
import { saveRouteCache } from "@/services/routeCacheService";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";

export default function PlanRouteScreen() {
  const { location, loading: locLoading } = useUserLocation();
  const { places } = useNearbyPlaces(location, { radiusMeters: 100_000 });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    destName: string;
    distance: number;
    duration: number;
    warning: string | null;
    along: Place[];
  } | null>(null);

  const planTo = async (name: string, lat: number, lng: number) => {
    if (!location) return;
    setBusy(true);
    setResult(null);

    const route = await fetchDrivingRoute(location, { latitude: lat, longitude: lng });
    if (!route) {
      setBusy(false);
      return;
    }

    const warning = await analyzeDeadZones(location, places, null, route.coordinates);
    const along = findPlacesAlongRoute(
      places.filter((p) => ["sto", "towing", "fuel", "tires"].includes(p.category)),
      route.coordinates
    ).slice(0, 8);

    const destPlace: Place = {
      id: `plan-${lat}-${lng}`,
      name: `Пункт: ${name}`,
      category: "sto",
      source: "local",
      coordinates: { latitude: lat, longitude: lng },
      distanceMeters: route.distanceMeters,
    };

    await saveRouteCache(destPlace, route);

    setResult({
      destName: name,
      distance: route.distanceMeters,
      duration: route.durationSeconds,
      warning: warning?.message ?? null,
      along,
    });
    setBusy(false);
  };

  if (locLoading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🗺 Мій маршрут</Text>
      <Text style={styles.sub}>
        Оберіть пункт призначення — попередження про «мертві зони» та СТО по дорозі
      </Text>

      {busy ? <ActivityIndicator color="#60a5fa" style={{ marginVertical: 20 }} /> : null}

      {UKRAINE_REGIONS.map((r) => (
        <Pressable key={r.id} style={styles.row} onPress={() => planTo(r.name, r.center.latitude, r.center.longitude)}>
          <Text style={styles.rowName}>{r.name}</Text>
          <Text style={styles.rowArrow}>→</Text>
        </Pressable>
      ))}

      {result ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>→ {result.destName}</Text>
          <Text style={styles.resultMeta}>
            {formatDistance(result.distance)} · {formatRouteDuration(result.duration)}
          </Text>
          {result.warning ? <Text style={styles.warn}>{result.warning}</Text> : null}
          <Text style={styles.alongTitle}>По дорозі ({result.along.length}):</Text>
          {result.along.map((p) => (
            <Text key={p.id} style={styles.alongItem}>
              • {p.name} ({formatDistance(p.distanceMeters)})
            </Text>
          ))}
          <Pressable
            style={styles.goBtn}
            onPress={() =>
              router.navigate({
                pathname: "/",
                params: {
                  buildRoute: JSON.stringify({
                    id: "planned",
                    name: result.destName,
                    category: "sto",
                    source: "local",
                    coordinates: UKRAINE_REGIONS.find((x) => x.name === result.destName)?.center,
                  }),
                },
              })
            }
          >
            <Text style={styles.goBtnText}>Побудувати маршрут на карті</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  title: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  sub: { color: "#94a3b8", marginBottom: 16, lineHeight: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  rowName: { color: "#e2e8f0", fontWeight: "600" },
  rowArrow: { color: "#60a5fa" },
  result: {
    marginTop: 20,
    backgroundColor: "#172554",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e40af",
  },
  resultTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 16 },
  resultMeta: { color: "#93c5fd", marginTop: 4, fontWeight: "600" },
  warn: { color: "#fcd34d", marginTop: 10, lineHeight: 18 },
  alongTitle: { color: "#94a3b8", marginTop: 12, fontWeight: "700" },
  alongItem: { color: "#cbd5e1", marginTop: 4, fontSize: 13 },
  goBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  goBtnText: { color: "#fff", fontWeight: "800" },
});
