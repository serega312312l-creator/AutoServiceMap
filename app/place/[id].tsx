import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { PlaceRatingButtons } from "@/components/PlaceRatingButtons";
import { ShareLocationButton } from "@/components/ShareLocationButton";
import { formatDistance } from "@/services/locationService";
import { Place } from "@/types/place";
import { callPhone, openNavigation, openWebsite } from "@/utils/navigation";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useHistory } from "@/hooks/useHistory";
import { usePremium } from "@/hooks/usePremium";

function getCategoryLabel(category: Place["category"]): string {
  return CATEGORY_FILTERS.find((item) => item.id === category)?.label ?? category;
}

export default function PlaceDetailsScreen() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const { isFavorite, toggleFavorite, recordVisit } = useSavedPlaces();
  const { logCall } = useHistory();
  const { isPremium } = usePremium();
  const [fav, setFav] = useState(false);

  let place: Place | null = null;
  try {
    place = params.data ? (JSON.parse(params.data) as Place) : null;
  } catch {
    place = null;
  }

  useEffect(() => {
    if (!place) return;
    recordVisit(place);
    setFav(isFavorite(place.id));
  }, [place, isFavorite, recordVisit]);

  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Місце не знайдено</Text>
      </View>
    );
  }

  const selectedPlace = place;

  const handleToggleFavorite = async () => {
    const nowFav = await toggleFavorite(selectedPlace);
    setFav(nowFav);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.name}>{selectedPlace.name}</Text>
        <Pressable onPress={handleToggleFavorite} hitSlop={8}>
          <Text style={styles.favIcon}>{fav ? "⭐" : "☆"}</Text>
        </Pressable>
      </View>

      <View style={styles.badges}>
        <Text style={styles.badge}>{getCategoryLabel(selectedPlace.category)}</Text>
        <Text style={styles.badgeMuted}>{selectedPlace.source === "google" ? "Google" : "OpenStreetMap"}</Text>
        {selectedPlace.distanceMeters != null && (
          <Text style={styles.badgeHighlight}>{formatDistance(selectedPlace.distanceMeters)}</Text>
        )}
      </View>

      {selectedPlace.rating != null && (
        <Text style={styles.rating}>Рейтинг: ★ {selectedPlace.rating.toFixed(1)}</Text>
      )}

      {selectedPlace.isOpen != null && (
        <Text style={[styles.status, selectedPlace.isOpen ? styles.open : styles.closed]}>
          {selectedPlace.isOpen ? "Зараз відкрито" : "Зараз зачинено"}
        </Text>
      )}

      {selectedPlace.address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Адреса</Text>
          <Text style={styles.sectionText}>{selectedPlace.address}</Text>
        </View>
      ) : null}

      {selectedPlace.phone ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Телефон</Text>
          <Pressable
            onPress={() => {
              callPhone(selectedPlace.phone!);
              logCall(selectedPlace);
            }}
          >
            <Text style={styles.link}>{selectedPlace.phone}</Text>
          </Pressable>
        </View>
      ) : null}

      {selectedPlace.website ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сайт</Text>
          <Pressable onPress={() => openWebsite(selectedPlace.website!)}>
            <Text style={styles.link}>{selectedPlace.website}</Text>
          </Pressable>
        </View>
      ) : null}

      {selectedPlace.openingHours ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Години роботи</Text>
          <Text style={styles.sectionText}>{selectedPlace.openingHours}</Text>
        </View>
      ) : null}

      {isPremium ? <PlaceRatingButtons placeId={selectedPlace.id} /> : null}

      <ShareLocationButton
        latitude={selectedPlace.coordinates.latitude}
        longitude={selectedPlace.coordinates.longitude}
        onShared={() => {}}
      />

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.navigate({
            pathname: "/",
            params: { buildRoute: JSON.stringify(selectedPlace) },
          })
        }
      >
        <Text style={styles.primaryButtonText}>Маршрут на карті</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => openNavigation(selectedPlace)}>
        <Text style={styles.secondaryButtonText}>Відкрити в Google Maps</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
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
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  favIcon: {
    fontSize: 28,
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
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
  rating: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  status: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 16,
  },
  open: {
    color: "#4ade80",
  },
  closed: {
    color: "#f87171",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  sectionText: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: "#60a5fa",
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryButtonText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  errorTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});
