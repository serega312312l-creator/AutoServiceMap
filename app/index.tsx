import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DEFAULT_RADIUS_METERS } from "@/constants/categories";
import { FilterBar } from "@/components/FilterBar";
import { DistanceFilter } from "@/components/DistanceFilter";
import { MapOverlayControls } from "@/components/MapOverlayControls";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PlaceList } from "@/components/PlaceList";
import { PlacesMap } from "@/components/PlacesMap";
import { RouteBar } from "@/components/RouteBar";
import { SavedPlacesBar } from "@/components/SavedPlacesBar";
import { SearchBar } from "@/components/SearchBar";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import { fetchDrivingRoute, RouteInfo } from "@/services/routeService";
import {
  filterPlaces,
  filterPlacesByDistance,
  filterPlacesByQuery,
} from "@/services/placesAggregator";
import { Place, PlaceCategory } from "@/types/place";

type ViewMode = "map" | "list";

export default function HomeScreen() {
  const params = useLocalSearchParams<{ buildRoute?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>("all");
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_METERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [routePlace, setRoutePlace] = useState<Place | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const isNavigating = routePlace != null;

  const {
    location,
    heading,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
    refresh: refreshLocation,
  } = useUserLocation({ navigationMode: isNavigating });

  const {
    places,
    isOffline,
    localCount,
    onlineCount,
    loading: placesLoading,
    error: placesError,
    refresh: refreshPlaces,
  } = useNearbyPlaces(location, { radiusMeters });

  const { favorites, recent, recordVisit } = useSavedPlaces();

  const filteredPlaces = useMemo(() => {
    let result = filterPlaces(places, selectedCategory);
    result = filterPlacesByDistance(result, radiusMeters);
    result = filterPlacesByQuery(result, searchQuery);
    return result;
  }, [places, selectedCategory, radiusMeters, searchQuery]);

  const buildRoute = useCallback(
    async (place: Place) => {
      if (!location) return;
      setRoutePlace(place);
      setRouteInfo(null);
      setRouteLoading(true);
      setViewMode("map");
      await recordVisit(place);

      const route = await fetchDrivingRoute(location, place.coordinates);
      setRouteInfo(route);
      setRouteLoading(false);
    },
    [location, recordVisit]
  );

  const clearRoute = useCallback(() => {
    setRoutePlace(null);
    setRouteInfo(null);
    setRouteLoading(false);
  }, []);

  useEffect(() => {
    if (!params.buildRoute || !location) return;
    try {
      const place = JSON.parse(params.buildRoute) as Place;
      buildRoute(place);
    } catch {
      // ignore
    }
  }, [params.buildRoute, location, buildRoute]);

  const handlePlacePress = async (place: Place) => {
    await recordVisit(place);
    router.push({
      pathname: "/place/[id]",
      params: { id: place.id, data: JSON.stringify(place) },
    });
  };

  const handleRefresh = async () => {
    clearRoute();
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

  if (!location) return null;

  if (viewMode === "list") {
    return (
      <View style={styles.container}>
        <View style={styles.listToolbar}>
          <View style={styles.toggle}>
            <Pressable style={styles.toggleBtn} onPress={() => setViewMode("map")}>
              <Text style={styles.toggleText}>Карта</Text>
            </Pressable>
            <Pressable style={[styles.toggleBtn, styles.toggleActive]}>
              <Text style={[styles.toggleText, styles.toggleTextActive]}>Список</Text>
            </Pressable>
          </View>
          <Text style={styles.listCount}>{filteredPlaces.length} місць</Text>
        </View>
        <OfflineBanner
          isOffline={isOffline}
          localCount={localCount}
          onlineCount={onlineCount}
          variant="inline"
        />
        <DistanceFilter selectedMeters={radiusMeters} onSelect={setRadiusMeters} />
        <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <PlaceList
          places={filteredPlaces}
          loading={placesLoading}
          onRefresh={handleRefresh}
          onPlacePress={handlePlacePress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlacesMap
        location={location}
        heading={heading}
        places={filteredPlaces}
        routeCoordinates={routeInfo?.coordinates}
        routeDestination={routePlace}
        isNavigating={isNavigating}
        onPlacePress={handlePlacePress}
      />

      <MapOverlayControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        radiusMeters={radiusMeters}
        onRadiusChange={setRadiusMeters}
        placeCount={filteredPlaces.length}
        onRefresh={handleRefresh}
      />

      <OfflineBanner
        isOffline={isOffline}
        localCount={localCount}
        onlineCount={onlineCount}
      />

      {!routePlace ? (
        <SavedPlacesBar
          favorites={favorites}
          recent={recent}
          onPlacePress={(p) => buildRoute(p)}
        />
      ) : null}

      <Pressable style={styles.breakdownFab} onPress={() => router.push("/breakdown")}>
        <Text style={styles.breakdownFabText}>🆘</Text>
      </Pressable>

      {routePlace ? (
        <RouteBar
          place={routePlace}
          distanceMeters={routeInfo?.distanceMeters ?? routePlace.distanceMeters ?? 0}
          durationSeconds={routeInfo?.durationSeconds ?? 0}
          loading={routeLoading}
          onClose={clearRoute}
        />
      ) : null}

      {placesLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#ffffff" size="small" />
        </View>
      ) : null}

      {placesError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorOverlayText}>{placesError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  listToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleActive: { backgroundColor: "#2563eb" },
  toggleText: { color: "#94a3b8", fontWeight: "600", fontSize: 13 },
  toggleTextActive: { color: "#ffffff" },
  listCount: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  loadingText: { marginTop: 12, color: "#cbd5e1" },
  loadingOverlay: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 10,
    borderRadius: 20,
  },
  errorOverlay: {
    position: "absolute",
    bottom: 120,
    left: 12,
    right: 12,
    backgroundColor: "rgba(69, 10, 10, 0.9)",
    padding: 10,
    borderRadius: 10,
  },
  errorOverlayText: { color: "#fecaca", fontSize: 12, textAlign: "center" },
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
  buttonText: { color: "#ffffff", fontWeight: "700" },
  breakdownFab: {
    position: "absolute",
    bottom: 24,
    left: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 20,
    borderWidth: 2,
    borderColor: "#fca5a5",
  },
  breakdownFabText: { fontSize: 22 },
});
