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
import { SERVICE_PRIORITY_CATEGORIES } from "@/constants/emergency";
import { DeadZoneBanner } from "@/components/DeadZoneBanner";
import { DistanceFilter } from "@/components/DistanceFilter";
import { FilterBar } from "@/components/FilterBar";
import { MapOverlayControls } from "@/components/MapOverlayControls";
import { NearestNowButton } from "@/components/NearestNowButton";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PlaceList } from "@/components/PlaceList";
import { PlacesMap } from "@/components/PlacesMap";
import { RouteAlternativesBar } from "@/components/RouteAlternativesBar";
import { RouteBar } from "@/components/RouteBar";
import { SavedPlacesBar } from "@/components/SavedPlacesBar";
import { SearchBar } from "@/components/SearchBar";
import { VoiceToggle } from "@/components/VoiceToggle";
import { useCarProfiles } from "@/hooks/useCarProfiles";
import { useHistory } from "@/hooks/useHistory";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { usePremium } from "@/hooks/usePremium";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useSos } from "@/hooks/useSos";
import { useUserLocation } from "@/hooks/useUserLocation";
import { filterPlacesForCar } from "@/services/carFilterService";
import { analyzeDeadZones, DeadZoneWarning } from "@/services/deadZoneService";
import {
  filterPlaces,
  filterPlacesByDistance,
  filterPlacesByQuery,
  findNearestByCategory,
} from "@/services/placesAggregator";
import {
  fetchDrivingRoutes,
  getRemainingRouteDistance,
  RouteInfo,
} from "@/services/routeService";
import { updateNavigationVoice } from "@/services/voiceGuidanceService";
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
  const [routeAlternatives, setRouteAlternatives] = useState<RouteInfo[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [deadZone, setDeadZone] = useState<DeadZoneWarning | null>(null);

  const isNavigating = routePlace != null;
  const { isPremium } = usePremium();
  const { activeCar } = useCarProfiles();
  const { logRoute } = useHistory();
  const { checkTimer } = useSos();

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

  const carFilteredPlaces = useMemo(
    () => (isPremium && activeCar ? filterPlacesForCar(places, activeCar) : places),
    [places, activeCar, isPremium]
  );

  const filteredPlaces = useMemo(() => {
    let result = filterPlaces(carFilteredPlaces, selectedCategory);
    result = filterPlacesByDistance(result, radiusMeters);
    result = filterPlacesByQuery(result, searchQuery);
    return result;
  }, [carFilteredPlaces, selectedCategory, radiusMeters, searchQuery]);

  const nearestService = useMemo(() => {
    for (const cat of SERVICE_PRIORITY_CATEGORIES) {
      const found = findNearestByCategory(filteredPlaces, cat);
      if (found) return found;
    }
    return filteredPlaces[0] ?? null;
  }, [filteredPlaces]);

  const buildRoute = useCallback(
    async (place: Place) => {
      if (!location) return;
      setRoutePlace(place);
      setRouteInfo(null);
      setRouteAlternatives([]);
      setRouteLoading(true);
      setViewMode("map");
      await recordVisit(place);
      await logRoute(place);

      const altCount = isPremium ? 3 : 1;
      const routes = await fetchDrivingRoutes(location, place.coordinates, altCount);
      setRouteAlternatives(routes);
      setSelectedRouteIndex(0);
      setRouteInfo(routes[0] ?? null);
      setRouteLoading(false);
    },
    [location, recordVisit, logRoute, isPremium]
  );

  const clearRoute = useCallback(() => {
    setRoutePlace(null);
    setRouteInfo(null);
    setRouteAlternatives([]);
    setRouteLoading(false);
  }, []);

  const selectRoute = useCallback(
    (index: number) => {
      setSelectedRouteIndex(index);
      setRouteInfo(routeAlternatives[index] ?? null);
    },
    [routeAlternatives]
  );

  useEffect(() => {
    if (!params.buildRoute || !location) return;
    try {
      const place = JSON.parse(params.buildRoute) as Place;
      buildRoute(place);
    } catch {
      // ignore
    }
  }, [params.buildRoute, location, buildRoute]);

  useEffect(() => {
    if (!location) return;
    analyzeDeadZones(location, filteredPlaces, heading, routeInfo?.coordinates).then(setDeadZone);
  }, [location, filteredPlaces, heading, routeInfo?.coordinates]);

  useEffect(() => {
    if (!isNavigating || !location || !routeInfo || !routePlace) return;
    const remaining = getRemainingRouteDistance(location, routeInfo.coordinates);
    updateNavigationVoice(location, routeInfo.coordinates, routePlace.name, remaining);
  }, [location, routeInfo, routePlace, isNavigating]);

  useEffect(() => {
    if (!location) return;
    const interval = setInterval(() => {
      checkTimer(location.latitude, location.longitude);
    }, 30000);
    return () => clearInterval(interval);
  }, [location, checkTimer]);

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
        <OfflineBanner isOffline={isOffline} localCount={localCount} onlineCount={onlineCount} variant="inline" />
        <DistanceFilter selectedMeters={radiusMeters} onSelect={setRadiusMeters} />
        <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        {nearestService ? (
          <Pressable style={styles.nearestListBtn} onPress={() => buildRoute(nearestService)}>
            <Text style={styles.nearestListText}>⚡ Найближчий: {nearestService.name}</Text>
          </Pressable>
        ) : null}
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

      <DeadZoneBanner warning={deadZone} onPremiumPress={() => router.push("/offline-maps")} />

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

      <OfflineBanner isOffline={isOffline} localCount={localCount} onlineCount={onlineCount} />

      {!routePlace && nearestService ? (
        <NearestNowButton place={nearestService} onPress={buildRoute} />
      ) : null}

      {!routePlace ? (
        <SavedPlacesBar favorites={favorites} recent={recent} onPlacePress={(p) => buildRoute(p)} />
      ) : null}

      {isPremium && isNavigating ? <VoiceToggle /> : null}

      <Pressable
        style={[styles.breakdownFab, routePlace ? styles.breakdownFabUp : null]}
        onPress={() => router.push("/breakdown")}
      >
        <Text style={styles.breakdownFabText}>🆘</Text>
      </Pressable>

      {routeAlternatives.length > 1 ? (
        <RouteAlternativesBar
          routes={routeAlternatives}
          selectedIndex={selectedRouteIndex}
          onSelect={selectRoute}
        />
      ) : null}

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
  nearestListBtn: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  nearestListText: { color: "#fff", fontWeight: "800" },
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
  breakdownFabUp: { bottom: 100 },
  breakdownFabText: { fontSize: 22 },
});
