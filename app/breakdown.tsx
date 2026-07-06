import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { EmergencyPanel } from "@/components/EmergencyPanel";
import { InsuranceChecklist } from "@/components/InsuranceChecklist";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ScenarioPicker } from "@/components/ScenarioPicker";
import { ShareLocationButton } from "@/components/ShareLocationButton";
import { BREAKDOWN_SCENARIOS } from "@/constants/scenarios";
import { useHistory } from "@/hooks/useHistory";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { usePremium } from "@/hooks/usePremium";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MAX_COVERAGE_RADIUS_METERS } from "@/constants/categories";
import { findNearestByCategory } from "@/services/placesAggregator";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";
import { ScenarioId } from "@/types/scenario";
import { callPhone } from "@/utils/navigation";

function ServiceCard({
  title,
  emoji,
  place,
  onRoute,
  onDetails,
}: {
  title: string;
  emoji: string;
  place: Place | null;
  onRoute: (p: Place) => void;
  onDetails: (p: Place) => void;
}) {
  if (!place) {
    return (
      <View style={styles.cardEmpty}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardEmptyText}>Не знайдено в радіусі 100 км</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardName} numberOfLines={2}>
        {place.name}
      </Text>
      <Text style={styles.cardDistance}>{formatDistance(place.distanceMeters)}</Text>
      {place.phone ? (
        <Pressable onPress={() => callPhone(place.phone!)}>
          <Text style={styles.cardPhone}>📞 {place.phone}</Text>
        </Pressable>
      ) : null}
      <View style={styles.cardActions}>
        <Pressable style={styles.routeBtn} onPress={() => onRoute(place)}>
          <Text style={styles.routeBtnText}>Маршрут</Text>
        </Pressable>
        <Pressable style={styles.detailBtn} onPress={() => onDetails(place)}>
          <Text style={styles.detailBtnText}>Деталі</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BreakdownScreen() {
  const { location, loading: locLoading, error: locError, refresh: refreshLocation } = useUserLocation();
  const { places, isOffline, localCount, onlineCount, loading } = useNearbyPlaces(location, {
    radiusMeters: MAX_COVERAGE_RADIUS_METERS,
  });
  const { favorites, recent } = useSavedPlaces();
  const { logBreakdown, logShare } = useHistory();
  const { isPremium } = usePremium();
  const [scenario, setScenario] = useState<ScenarioId | null>(null);

  const scenarioDef = BREAKDOWN_SCENARIOS.find((s) => s.id === scenario);

  const scenarioPlaces = useMemo(() => {
    if (!scenarioDef) return null;
    const result: { title: string; emoji: string; place: Place | null }[] = [];
    const labels: Record<string, { title: string; emoji: string }> = {
      towing: { title: "Евакуатор", emoji: "🛻" },
      sto: { title: "СТО", emoji: "🔧" },
      tires: { title: "Шиномонтаж", emoji: "🛞" },
      fuel: { title: "АЗС", emoji: "⛽" },
      autoshop: { title: "Запчастини", emoji: "🛒" },
      diagnostics: { title: "Діагностика", emoji: "🖥️" },
      body_shop: { title: "Кузовний", emoji: "🎨" },
    };

    for (const cat of scenarioDef.categories) {
      const info = labels[cat] ?? { title: cat, emoji: "📍" };
      result.push({
        ...info,
        place: findNearestByCategory(places, cat),
      });
    }
    return result;
  }, [scenarioDef, places]);

  const nearestTow = useMemo(() => findNearestByCategory(places, "towing"), [places]);
  const nearestSto = useMemo(() => findNearestByCategory(places, "sto"), [places]);
  const nearestTires = useMemo(() => findNearestByCategory(places, "tires"), [places]);

  useEffect(() => {
    if (scenario) logBreakdown(scenario);
  }, [scenario, logBreakdown]);

  const goRoute = (place: Place) => {
    router.navigate({
      pathname: "/",
      params: { buildRoute: JSON.stringify(place) },
    });
  };

  const goDetails = (place: Place) => {
    router.push({
      pathname: "/place/[id]",
      params: { id: place.id, data: JSON.stringify(place) },
    });
  };

  if (locLoading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#60a5fa" size="large" />
        <Text style={styles.loadingText}>Шукаємо допомогу поруч...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#60a5fa" size="large" />
        <Text style={styles.loadingText}>{locError ?? "Очікуємо GPS-сигнал..."}</Text>
        <Pressable style={styles.retryBtn} onPress={refreshLocation}>
          <Text style={styles.retryText}>Спробувати знову</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headline}>🆘 Поломка на дорозі</Text>
      <Text style={styles.subhead}>
        Екстрені служби та найближчі сервіси в радіусі 100 км. Працює навіть без інтернету.
      </Text>

      <ShareLocationButton
        latitude={location.latitude}
        longitude={location.longitude}
        onShared={() => logShare(location.latitude, location.longitude)}
        large
      />

      {isPremium ? (
        <Pressable style={styles.sosLink} onPress={() => router.push("/sos")}>
          <Text style={styles.sosLinkText}>👑 SOS сім&apos;ї (Premium)</Text>
        </Pressable>
      ) : null}

      <EmergencyPanel />

      <ScenarioPicker selected={scenario} onSelect={(id) => setScenario(id)} />

      {scenarioDef ? (
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>
            {scenarioDef.emoji} {scenarioDef.label}
          </Text>
          {scenarioDef.tips.map((tip) => (
            <Text key={tip} style={styles.tip}>
              • {tip}
            </Text>
          ))}
        </View>
      ) : null}

      {scenario === "accident" ? <InsuranceChecklist /> : null}

      <OfflineBanner
        isOffline={isOffline}
        localCount={localCount}
        onlineCount={onlineCount}
        variant="inline"
      />

      {loading ? (
        <ActivityIndicator color="#60a5fa" style={{ marginVertical: 20 }} />
      ) : scenarioPlaces ? (
        scenarioPlaces.map((item) => (
          <ServiceCard
            key={item.title}
            title={item.title}
            emoji={item.emoji}
            place={item.place}
            onRoute={goRoute}
            onDetails={goDetails}
          />
        ))
      ) : (
        <>
          <ServiceCard title="Евакуатор" emoji="🛻" place={nearestTow} onRoute={goRoute} onDetails={goDetails} />
          <ServiceCard title="СТО" emoji="🔧" place={nearestSto} onRoute={goRoute} onDetails={goDetails} />
          <ServiceCard title="Шиномонтаж" emoji="🛞" place={nearestTires} onRoute={goRoute} onDetails={goDetails} />
        </>
      )}

      {favorites.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Улюблені</Text>
          {favorites.map((p) => (
            <Pressable key={p.id} style={styles.listItem} onPress={() => goDetails(p)}>
              <Text style={styles.listName}>{p.name}</Text>
              <Text style={styles.listMeta}>{formatDistance(p.distanceMeters)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {recent.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Нещодавні</Text>
          {recent.map((p) => (
            <Pressable key={p.id} style={styles.listItem} onPress={() => goDetails(p)}>
              <Text style={styles.listName}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable style={styles.mapLink} onPress={() => router.push("/")}>
        <Text style={styles.mapLinkText}>🗺 Відкрити карту</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: { color: "#94a3b8", marginTop: 12, textAlign: "center", paddingHorizontal: 24 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  headline: { color: "#f87171", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subhead: { color: "#94a3b8", lineHeight: 20, marginBottom: 12 },
  sosLink: { marginVertical: 8, alignItems: "center" },
  sosLinkText: { color: "#fbbf24", fontWeight: "700" },
  tipsBox: {
    backgroundColor: "#172554",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e40af",
  },
  tipsTitle: { color: "#93c5fd", fontWeight: "800", marginBottom: 6 },
  tip: { color: "#cbd5e1", fontSize: 13, lineHeight: 20 },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardEmpty: {
    backgroundColor: "#172554",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  cardEmoji: { fontSize: 28, marginBottom: 4 },
  cardTitle: { color: "#93c5fd", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  cardName: { color: "#f8fafc", fontSize: 16, fontWeight: "700", marginTop: 4 },
  cardDistance: { color: "#60a5fa", fontSize: 14, fontWeight: "700", marginTop: 4 },
  cardPhone: { color: "#4ade80", fontSize: 14, marginTop: 6, fontWeight: "600" },
  cardEmptyText: { color: "#64748b", marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  routeBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  routeBtnText: { color: "#fff", fontWeight: "700" },
  detailBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#475569",
  },
  detailBtnText: { color: "#cbd5e1", fontWeight: "600" },
  section: { marginTop: 16 },
  sectionTitle: { color: "#f8fafc", fontWeight: "700", marginBottom: 8 },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  listName: { color: "#e2e8f0", fontWeight: "600" },
  listMeta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  mapLink: {
    marginTop: 20,
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  mapLinkText: { color: "#f8fafc", fontWeight: "700" },
});
