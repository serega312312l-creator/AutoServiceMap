import { useCallback, useEffect, useState } from "react";
import {
  getPlaceRatingSummary,
  ratePlace,
  PlaceRatingSummary,
  UserRatingValue,
} from "@/services/placeRatingService";

export function usePlaceRating(placeId: string) {
  const [summary, setSummary] = useState<PlaceRatingSummary>({
    responds: 0,
    noAnswer: 0,
    closed: 0,
    helpful: 0,
    score: 0,
  });

  const refresh = useCallback(async () => {
    setSummary(await getPlaceRatingSummary(placeId));
  }, [placeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rate = useCallback(
    async (value: UserRatingValue) => {
      await ratePlace(placeId, value);
      await refresh();
    },
    [placeId, refresh]
  );

  return { summary, rate, refresh };
}
