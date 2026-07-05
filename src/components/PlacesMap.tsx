import { useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { CATEGORY_FILTERS } from "@/constants/categories";
import { Place, UserLocation } from "@/types/place";

interface PlacesMapProps {
  location: UserLocation;
  places: Place[];
  nearestPlaceId?: string;
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
  places,
  nearestPlaceId,
  onPlacePress,
}: PlacesMapProps) {
  const mapRef = useRef<MapView>(null);

  const region: Region = useMemo(
    () => ({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [location.latitude, location.longitude]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        onMapReady={() => {
          if (places.length > 0) {
            mapRef.current?.fitToCoordinates(
              [
                { latitude: location.latitude, longitude: location.longitude },
                ...places.slice(0, 5).map((p) => p.coordinates),
              ],
              { edgePadding: { top: 80, right: 40, bottom: 120, left: 40 }, animated: true }
            );
          }
        }}
      >
        {places.map((place) => {
          const isNearest = place.id === nearestPlaceId;
          const color = getMarkerColor(place.category);
          return (
            <Marker
              key={place.id}
              coordinate={place.coordinates}
              title={place.name}
              description={place.address}
              onCalloutPress={() => onPlacePress(place)}
              onPress={() => onPlacePress(place)}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: color, borderColor: isNearest ? "#fbbf24" : "#fff" },
                  isNearest && styles.markerNearest,
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  markerNearest: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
  },
  markerEmoji: {
    fontSize: 16,
  },
});
