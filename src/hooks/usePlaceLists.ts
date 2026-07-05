import { useCallback, useEffect, useState } from "react";
import {
  addPlaceToList,
  createPlaceList,
  deletePlaceList,
  getPlaceLists,
  removePlaceFromList,
  renamePlaceList,
} from "@/services/placeListsService";
import {
  getFavorites,
  removeFavorite,
  toggleFavorite,
  updateFavoriteTag,
} from "@/services/savedPlacesService";
import { Place } from "@/types/place";
import { PlaceList, PlaceTag, SavedPlaceEntry } from "@/types/user";

export function usePlaceLists() {
  const [lists, setLists] = useState<PlaceList[]>([]);
  const [favorites, setFavorites] = useState<SavedPlaceEntry[]>([]);

  const reload = useCallback(async () => {
    const [l, f] = await Promise.all([getPlaceLists(), getFavorites()]);
    setLists(l);
    setFavorites(f);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    lists,
    favorites,
    reload,
    createList: async (name: string) => {
      await createPlaceList(name);
      await reload();
    },
    addToList: async (listId: string, place: Place) => {
      await addPlaceToList(listId, place);
      await reload();
    },
    removeFromList: async (listId: string, placeId: string) => {
      await removePlaceFromList(listId, placeId);
      await reload();
    },
    deleteList: async (listId: string) => {
      await deletePlaceList(listId);
      await reload();
    },
    renameList: async (listId: string, name: string) => {
      await renamePlaceList(listId, name);
      await reload();
    },
    toggleFavorite: async (place: Place, tag?: PlaceTag) => {
      await toggleFavorite(place, tag);
      await reload();
    },
    setTag: async (placeId: string, tag: PlaceTag, note?: string) => {
      await updateFavoriteTag(placeId, tag, note);
      await reload();
    },
    removeFavorite: async (placeId: string) => {
      await removeFavorite(placeId);
      await reload();
    },
  };
}
