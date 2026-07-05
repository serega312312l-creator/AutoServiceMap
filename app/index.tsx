import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { FilterBar } from "@/components/FilterBar";
import { PlaceList } from "@/components/PlaceList";
import { PlacesMap } from "@/components/PlacesMap";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import { filterPlaces } from "@/services/placesAggregator";
import { Place, PlaceCategory } from "@/types/place";

type ViewMode = "map" | "list";

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>("all");

  const { location, loading: locationLoading, error: locationError, permissionDenied, refresh: refreshLocation } =
    useUserLocation();
  const { places, loading: placesLoading, error: placesError, refresh: refreshPlaces } =
    useNearbyPlaces(location);

  const filteredPlaces = useMemo(
    () => filterPlaces(places, selectedCategory),
    [places, selectedCategory]
  );

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
          Без геолокації застосунок не зможе показати СТО та автомагазини поруч з вами.
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

  return (
    <View style={styles.container}>
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

        <Text style={styles.count}>
          {filteredPlaces.length} {filteredPlaces.length === 1 ? "місце" : "місць"}
        </Text>
      </View>

      <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />

      {placesError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{placesError}</Text>
        </View>
      ) : null}

      {viewMode === "map" ? (
        <PlacesMap
          location={location}
          places={filteredPlaces}
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
          <Text style={styles.loadingOverlayText}>Оновлюємо місця поруч...</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: "#2563eb",
  },
  toggleText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  count: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#451a03",
  },
  bannerText: {
    color: "#fdba74",
    textAlign: "center",
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
