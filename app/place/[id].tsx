import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { PlaceRatingButtons } from "@/components/PlaceRatingButtons";
import {
  PlaceCommentBlock,
  PlaceCoordinatesBlock,
  PlacePhoneBlock,
  PlacePhotoBlock,
} from "@/components/PlaceDetailsExtras";
import { formatDistance } from "@/services/locationService";
import { getLocalPlaceById } from "@/services/localDatabaseService";
import { getUserSubmittedPhone } from "@/services/placeUserDataService";
import { Place } from "@/types/place";
import { openNavigation, openWebsite } from "@/utils/navigation";
import { formatDisplayAddress, mergePlaceData, parsePhoneList } from "@/utils/placeFormat";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useHistory } from "@/hooks/useHistory";

function getCategoryLabel(category: Place["category"]): string {
  return CATEGORY_FILTERS.find((item) => item.id === category)?.label ?? category;
}

export default function PlaceDetailsScreen() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const { isFavorite, toggleFavorite, recordVisit } = useSavedPlaces();
  const { logCall } = useHistory();
  const [fav, setFav] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [extraPhones, setExtraPhones] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let fromParams: Place | null = null;
      try {
        fromParams = params.data ? (JSON.parse(params.data) as Place) : null;
      } catch {
        fromParams = null;
      }

      const id = params.id ?? fromParams?.id;
      if (!id) return;

      const fromDb = await getLocalPlaceById(id);
      const merged = mergePlaceData(fromParams ?? fromDb!, fromDb);
      const userPhone = await getUserSubmittedPhone(id);

      const allPhones = [
        ...(merged.phones ?? parsePhoneList(merged.phone)),
        ...(userPhone ? [userPhone] : []),
      ].filter((v, i, a) => a.indexOf(v) === i);

      if (!cancelled) {
        setPlace({ ...merged, phones: allPhones, phone: allPhones[0] });
        setExtraPhones(allPhones);
        recordVisit(merged);
        setFav(isFavorite(merged.id));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, params.data, isFavorite, recordVisit]);

  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Завантаження...</Text>
      </View>
    );
  }

  const displayAddress = formatDisplayAddress(place);

  const handleToggleFavorite = async () => {
    const nowFav = await toggleFavorite(place);
    setFav(nowFav);
  };

  const handlePhoneAdded = (phone: string) => {
    setExtraPhones((prev) => [...prev, phone].filter((v, i, a) => a.indexOf(v) === i));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{place.name}</Text>
        <Pressable onPress={handleToggleFavorite} hitSlop={8}>
          <Text style={styles.favIcon}>{fav ? "⭐" : "☆"}</Text>
        </Pressable>
      </View>

      <View style={styles.badges}>
        <Text style={styles.badge}>{getCategoryLabel(place.category)}</Text>
        <Text style={styles.badgeMuted}>
          {place.source === "google" ? "Google" : "OpenStreetMap"}
        </Text>
        {place.distanceMeters != null && (
          <Text style={styles.badgeHighlight}>{formatDistance(place.distanceMeters)}</Text>
        )}
      </View>

      {place.rating != null && (
        <Text style={styles.rating}>Рейтинг Google: ★ {place.rating.toFixed(1)}</Text>
      )}

      {place.isOpen != null && (
        <Text style={[styles.status, place.isOpen ? styles.open : styles.closed]}>
          {place.isOpen ? "Зараз відкрито" : "Зараз зачинено"}
        </Text>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Адреса</Text>
        <Text style={styles.sectionText}>{displayAddress}</Text>
        {place.region && !displayAddress.includes(place.region) ? (
          <Text style={styles.regionText}>{place.region}</Text>
        ) : null}
      </View>

      <PlaceCoordinatesBlock
        latitude={place.coordinates.latitude}
        longitude={place.coordinates.longitude}
      />

      <PlacePhoneBlock
        placeId={place.id}
        phones={extraPhones}
        onPhoneAdded={handlePhoneAdded}
        onCall={() => logCall(place)}
      />

      <PlacePhotoBlock placeId={place.id} placeName={place.name} />

      {place.website ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сайт</Text>
          <Pressable onPress={() => openWebsite(place.website!)}>
            <Text style={styles.link}>{place.website}</Text>
          </Pressable>
        </View>
      ) : null}

      {place.openingHours ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Години роботи</Text>
          <Text style={styles.sectionText}>{place.openingHours}</Text>
        </View>
      ) : null}

      <PlaceRatingButtons placeId={place.id} />

      <PlaceCommentBlock placeId={place.id} />

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.navigate({
            pathname: "/",
            params: { buildRoute: JSON.stringify(place) },
          })
        }
      >
        <Text style={styles.primaryButtonText}>Маршрут на карті</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => openNavigation(place)}>
        <Text style={styles.secondaryButtonText}>Відкрити в Google Maps</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  name: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  favIcon: { fontSize: 28, marginTop: 4 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  badge: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeMuted: {
    backgroundColor: "#172554",
    color: "#93c5fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeHighlight: {
    backgroundColor: "#14532d",
    color: "#86efac",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
  },
  rating: { color: "#fbbf24", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  status: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  open: { color: "#4ade80" },
  closed: { color: "#f87171" },
  section: { marginBottom: 18 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  sectionText: { color: "#e2e8f0", fontSize: 15, lineHeight: 22 },
  regionText: { color: "#64748b", fontSize: 13, marginTop: 4 },
  link: { color: "#60a5fa", fontSize: 15, lineHeight: 22 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryButtonText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  errorTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
});
