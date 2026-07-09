import { Share } from "react-native";
import { Place } from "@/types/place";
import { formatDisplayAddress, getGoogleMapsUrl } from "@/utils/placeFormat";

export async function sharePlace(place: Place): Promise<void> {
  const address = formatDisplayAddress(place);
  const maps = getGoogleMapsUrl(place.coordinates.latitude, place.coordinates.longitude);
  const phone = place.phone ? `\n📞 ${place.phone}` : "";
  const deepLink = `avtogid://place/${encodeURIComponent(place.id)}`;

  await Share.share({
    title: place.name,
    message: `${place.name}\n${address}${phone}\n🗺 ${maps}\n\nВідкрити в AVTOGID: ${deepLink}`,
  });
}
