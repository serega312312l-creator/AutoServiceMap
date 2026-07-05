import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { Coordinates, Place, UserLocation } from "@/types/place";

interface PlacesMapProps {
  location: UserLocation;
  heading?: number | null;
  places: Place[];
  routeCoordinates?: Coordinates[];
  routeDestination?: Place | null;
  isNavigating?: boolean;
  onPlacePress: (place: Place) => void;
}

const MARKER_COLORS: Record<Exclude<Place["category"], "all">, string> = {
  sto: "#ef4444",
  autoshop: "#22c55e",
  tires: "#f59e0b",
  towing: "#f97316",
  car_dealer: "#3b82f6",
  car_wash: "#06b6d4",
  fuel: "#a855f7",
  ev_charging: "#84cc16",
  diagnostics: "#6366f1",
  body_shop: "#ec4899",
  motorcycle: "#14b8a6",
  truck_service: "#78716c",
  parking: "#64748b",
  other_auto: "#94a3b8",
};

function getMarkerColor(category: Place["category"]): string {
  if (category === "all") return "#2563eb";
  return MARKER_COLORS[category];
}

function getCategoryEmoji(category: Place["category"]): string {
  return CATEGORY_FILTERS.find((c) => c.id === category)?.emoji ?? "📍";
}

export function PlacesMap({
  location,
  heading,
  places,
  routeCoordinates,
  routeDestination,
  isNavigating = false,
  onPlacePress,
}: PlacesMapProps) {
  const mapRef = useRef<MapView>(null);

  const region: Region = useMemo(
    () => ({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: isNavigating ? 0.02 : 0.15,
      longitudeDelta: isNavigating ? 0.02 : 0.15,
    }),
    [location.latitude, location.longitude, isNavigating]
  );

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1 && !isNavigating) {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: location.latitude, longitude: location.longitude },
          ...routeCoordinates,
        ],
        { edgePadding: { top: 100, right: 40, bottom: 100, left: 40 }, animated: true }
      );
    }
  }, [routeCoordinates, isNavigating, location.latitude, location.longitude]);

  useEffect(() => {
    if (!isNavigating) return;
    mapRef.current?.animateCamera(
      {
        center: { latitude: location.latitude, longitude: location.longitude },
        pitch: 0,
        heading: heading ?? 0,
        zoom: 16,
      },
      { duration: 800 }
    );
  }, [location.latitude, location.longitude, heading, isNavigating]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={!isNavigating}
        showsMyLocationButton={!isNavigating}
        followsUserLocation={isNavigating}
        showsCompass={isNavigating}
      >
        {isNavigating ? (
          <Marker
            coordinate={location}
            anchor={{ x: 0.5, y: 0.5 }}
            flat
            rotation={heading ?? 0}
          >
            <View style={styles.navMarker}>
              <View style={styles.navArrow} />
            </View>
          </Marker>
        ) : null}

        {routeCoordinates && routeCoordinates.length > 1 ? (
          <Polyline coordinates={routeCoordinates} strokeColor="#2563eb" strokeWidth={5} />
        ) : null}

        {places.map((place) => {
          const isDestination = place.id === routeDestination?.id;
          const color = getMarkerColor(place.category);
          return (
            <Marker
              key={place.id}
              coordinate={place.coordinates}
              title={place.name}
              description={place.address}
              onPress={() => onPlacePress(place)}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: color, borderColor: isDestination ? "#fbbf24" : "#fff" },
                  isDestination && styles.markerHighlight,
                ]}
              >
                <Text style={styles.markerEmoji}>{getCategoryEmoji(place.category)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  markerHighlight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  markerEmoji: { fontSize: 15 },
  navMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  navArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#fff",
    marginTop: -4,
  },
});
