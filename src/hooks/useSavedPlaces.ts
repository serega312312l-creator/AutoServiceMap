import { useCallback, useEffect, useState } from "react";
import {
  addToRecent,
  getFavorites,
  getRecent,
  toggleFavorite as toggleFavoriteStorage,
  updateFavoriteTag,
} from "@/services/savedPlacesService";
import { Place } from "@/types/place";
import { PlaceTag, SavedPlaceEntry } from "@/types/user";

export function useSavedPlaces() {
  const [favoriteEntries, setFavoriteEntries] = useState<SavedPlaceEntry[]>([]);
  const [recent, setRecent] = useState<Place[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const [fav, rec] = await Promise.all([getFavorites(), getRecent()]);
    setFavoriteEntries(fav);
    setRecent(rec);
    setFavoriteIds(new Set(fav.map((e) => e.place.id)));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleFavorite = useCallback(
    async (place: Place, tag?: PlaceTag) => {
      const nowFavorite = await toggleFavoriteStorage(place, tag);
      await reload();
      return nowFavorite;
    },
    [reload]
  );

  const setFavoriteTag = useCallback(
    async (placeId: string, tag: PlaceTag) => {
      await updateFavoriteTag(placeId, tag);
      await reload();
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

  const favorites = favoriteEntries.map((e) => e.place);

  return {
    favorites,
    favoriteEntries,
    recent,
    isFavorite,
    toggleFavorite,
    setFavoriteTag,
    recordVisit,
    reload,
  };
}
