import { useCallback, useEffect, useState } from "react";
import {
  addToRecent,
  getFavorites,
  getRecent,
  isFavorite as checkFavorite,
  toggleFavorite as toggleFavoriteStorage,
} from "@/services/savedPlacesService";
import { Place } from "@/types/place";

export function useSavedPlaces() {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [recent, setRecent] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const [fav, rec] = await Promise.all([getFavorites(), getRecent()]);
    setFavorites(fav);
    setRecent(rec);
    setFavoriteIds(new Set(fav.map((p) => p.id)));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleFavorite = useCallback(
    async (place: Place) => {
      const nowFavorite = await toggleFavoriteStorage(place);
      await reload();
      return nowFavorite;
    },
    [reload]
  );

  const recordVisit = useCallback(
    async (place: Place) => {
      await addToRecent(place);
      await reload();
    },
    [reload]
  );

  const isFavorite = useCallback(
    (placeId: string) => favoriteIds.has(placeId),
    [favoriteIds]
  );

  return {
    favorites,
    recent,
    isFavorite,
    toggleFavorite,
    recordVisit,
    reload,
  };
}
