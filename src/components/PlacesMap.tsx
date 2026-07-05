import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Place, UserLocation } from "@/types/place";

interface PlacesMapProps {
  location: UserLocation;
  places: Place[];
  selectedPlaceId?: string;
  onPlacePress: (place: Place) => void;
}

const MARKER_COLORS: Record<Exclude<Place["category"], "all">, string> = {
  sto: "#ef4444",
  autoshop: "#22c55e",
  tires: "#f59e0b",
  car_dealer: "#3b82f6",
  car_wash: "#06b6d4",
  fuel: "#a855f7",
  ev_charging: "#84cc16",
  diagnostics: "#6366f1",
  towing: "#f97316",
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

export function PlacesMap({
  location,
  places,
  selectedPlaceId,
  onPlacePress,
}: PlacesMapProps) {
  const region: Region = useMemo(
    () => ({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }),
    [location.latitude, location.longitude]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={place.name}
            description={place.address}
            pinColor={getMarkerColor(place.category)}
            opacity={selectedPlaceId && selectedPlaceId !== place.id ? 0.5 : 1}
            onCalloutPress={() => onPlacePress(place)}
          />
        ))}
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
});
