import { Linking, Platform } from "react-native";
import { Place } from "@/types/place";

export function openNavigation(place: Place): void {
  const { latitude, longitude } = place.coordinates;
  const label = encodeURIComponent(place.name);

  const url =
    Platform.OS === "ios"
      ? `maps:0,0?q=${label}@${latitude},${longitude}`
      : `geo:0,0?q=${latitude},${longitude}(${label})`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );
  });
}

export function callPhone(phone: string): void {
  Linking.openURL(`tel:${phone}`);
}

export function openWebsite(url: string): void {
  Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
}
