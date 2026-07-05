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
import { PlaceList } from "@/components/PlaceList";
import { PlacesMap } from "@/components/PlacesMap";
import { RouteBar } from "@/components/RouteBar";
import { SearchBar } from "@/components/SearchBar";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
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

  const {
    location,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
    refresh: refreshLocation,
  } = useUserLocation();

  const {
    places,
    effectiveRadiusMeters,
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

  const buildRoute = useCallback(
    async (place: Place) => {
      if (!location) return;
      setRoutePlace(place);
      setRouteInfo(null);
      setRouteLoading(true);
      setViewMode("map");

      const route = await fetchDrivingRoute(location, place.coordinates);
      setRouteInfo(route);
      setRouteLoading(false);
    },
    [location]
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
      // ignore invalid param
    }
  }, [params.buildRoute, location, buildRoute]);

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

  if (!location) {
    return null;
  }

  if (viewMode === "list") {
    return (
      <View style={styles.container}>
        <View style={styles.listToolbar}>
          <View style={styles.toggle}>
            <Pressable
              style={[styles.toggleBtn, viewMode === "map" && styles.toggleActive]}
              onPress={() => setViewMode("map")}
            >
              <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>Карта</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, styles.toggleActive]}
              onPress={() => setViewMode("list")}
            >
              <Text style={[styles.toggleText, styles.toggleTextActive]}>Список</Text>
            </Pressable>
          </View>
          <Text style={styles.listCount}>{filteredPlaces.length} місць</Text>
        </View>
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
        places={filteredPlaces}
        routeCoordinates={routeInfo?.coordinates}
        routeDestination={routePlace}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
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
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleActive: {
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
  listCount: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  loadingText: {
    marginTop: 12,
    color: "#cbd5e1",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 10,
    borderRadius: 20,
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
