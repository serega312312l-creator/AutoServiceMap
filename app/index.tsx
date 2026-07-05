import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { DEFAULT_RADIUS_METERS } from "@/constants/categories";
import { DistanceFilter } from "@/components/DistanceFilter";
import { EmergencyPanel } from "@/components/EmergencyPanel";
import { FilterBar } from "@/components/FilterBar";
import { NearestPlaceBanner } from "@/components/NearestPlaceBanner";
import { PlaceList } from "@/components/PlaceList";
import { PlacesMap } from "@/components/PlacesMap";
import { SearchBar } from "@/components/SearchBar";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  filterPlaces,
  filterPlacesByDistance,
  filterPlacesByQuery,
} from "@/services/placesAggregator";
import { Place, PlaceCategory } from "@/types/place";

type ViewMode = "map" | "list";

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>("all");
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    location,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
    refresh: refreshLocation,
  } = useUserLocation();

  const {
    places,
    nearestService,
    effectiveRadiusMeters,
    expandedSearch,
    loading: placesLoading,
    error: placesError,
    refresh: refreshPlaces,
  } = useNearbyPlaces(location, { radiusMeters, autoExpand: true });

  const filteredPlaces = useMemo(() => {
    let result = filterPlaces(places, selectedCategory);
    result = filterPlacesByDistance(result, effectiveRadiusMeters);
    result = filterPlacesByQuery(result, searchQuery);
    return result;
  }, [places, selectedCategory, effectiveRadiusMeters, searchQuery]);

  const handlePlacePress = (place: Place) => {
    router.push({
      pathname: "/place/[id]",
      params: {
        id: place.id,
        data: JSON.stringify(place),
      },
    });
  };

  const handleRefresh = async () => {
    await refreshLocation();
    await refreshPlaces();
  };

  if (locationLoading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={styles.loadingText}>Визначаємо ваше місцезнаходження...</Text>
      </View>
    );
  }

  if (permissionDenied || locationError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Потрібен доступ до геолокації</Text>
        <Text style={styles.errorText}>
          Без геолокації застосунок не зможе знайти найближче СТО чи евакуатор.
        </Text>
        <Pressable style={styles.button} onPress={refreshLocation}>
          <Text style={styles.buttonText}>Надати доступ</Text>
        </Pressable>
      </View>
    );
  }

  if (!location) {
    return null;
  }

  const showNearest =
    nearestService &&
    (filteredPlaces.length <= 3 || (nearestService.distanceMeters ?? 0) > 5_000);

  return (
    <View style={styles.container}>
      <EmergencyPanel />

      <View style={styles.toolbar}>
        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleButton, viewMode === "map" && styles.toggleButtonActive]}
            onPress={() => setViewMode("map")}
          >
            <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>
              Карта
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
            onPress={() => setViewMode("list")}
          >
            <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>
              Список
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.refreshChip} onPress={handleRefresh}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>

        <Text style={styles.count}>
          {filteredPlaces.length} {filteredPlaces.length === 1 ? "місце" : "місць"}
        </Text>
      </View>

      <DistanceFilter selectedMeters={radiusMeters} onSelect={setRadiusMeters} />
      <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />

      {viewMode === "list" ? <SearchBar value={searchQuery} onChange={setSearchQuery} /> : null}

      {placesError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{placesError}</Text>
        </View>
      ) : null}

      {showNearest && nearestService ? (
        <NearestPlaceBanner
          place={nearestService}
          expandedSearch={expandedSearch}
          effectiveRadiusKm={Math.round(effectiveRadiusMeters / 1000)}
          onPress={handlePlacePress}
        />
      ) : null}

      {filteredPlaces.length === 0 && !placesLoading ? (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>
            Поруч немає сервісів. Спробуйте збільшити радіус або натисніть ↻ для повторного пошуку.
          </Text>
        </View>
      ) : null}

      {viewMode === "map" ? (
        <PlacesMap
          location={location}
          places={filteredPlaces}
          nearestPlaceId={nearestService?.id}
          onPlacePress={handlePlacePress}
        />
      ) : (
        <PlaceList
          places={filteredPlaces}
          loading={placesLoading}
          onRefresh={handleRefresh}
          onPlacePress={handlePlacePress}
        />
      )}

      {placesLoading && viewMode === "map" ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#ffffff" />
          <Text style={styles.loadingOverlayText}>Шукаємо сервіси поруч...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 3,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#2563eb",
  },
  toggleText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 13,
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  refreshChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  refreshText: {
    color: "#60a5fa",
    fontSize: 18,
    fontWeight: "700",
  },
  count: {
    flex: 1,
    textAlign: "right",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#451a03",
  },
  bannerText: {
    color: "#fdba74",
    textAlign: "center",
    fontSize: 12,
  },
  emptyBanner: {
    marginHorizontal: 12,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    color: "#cbd5e1",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
  },
  loadingOverlayText: {
    color: "#f8fafc",
    fontSize: 13,
  },
  errorTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
