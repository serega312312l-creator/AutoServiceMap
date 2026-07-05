import { useCallback, useEffect, useState } from "react";
import {
  getPlaceRatingSummary,
  getUserRatingForPlace,
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
  const [userRating, setUserRating] = useState<UserRatingValue | null>(null);
  const [justRated, setJustRated] = useState(false);

  const refresh = useCallback(async () => {
    const [s, u] = await Promise.all([
      getPlaceRatingSummary(placeId),
      getUserRatingForPlace(placeId),
    ]);
    setSummary(s);
    setUserRating(u);
  }, [placeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rate = useCallback(
    async (value: UserRatingValue) => {
      await ratePlace(placeId, value);
      setUserRating(value);
      setJustRated(true);
      await refresh();
      setTimeout(() => setJustRated(false), 2000);
    },
    [placeId, refresh]
  );

  return { summary, userRating, justRated, rate, refresh };
}
