"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

interface FavoritesState {
  favoriteIds: number[];
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      _hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      addFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds
            : [...state.favoriteIds, id],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((favId) => favId !== id),
        })),
      isFavorite: (id) => get().favoriteIds.includes(id),
      toggleFavorite: (id) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(id)) {
          set({ favoriteIds: favoriteIds.filter((favId) => favId !== id) });
        } else {
          set({ favoriteIds: [...favoriteIds, id] });
        }
      },
    }),
    {
      name: "pharmacy-favorites",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useFavorites() {
  const store = useFavoritesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (useFavoritesStore.getState()._hasHydrated) {
      setIsHydrated(true);
      return;
    }

    const unsubscribe = useFavoritesStore.subscribe((state) => {
      if (state._hasHydrated) {
        setIsHydrated(true);
      }
    });

    return unsubscribe;
  }, []);

  return {
    ...store,
    isHydrated,
    favoriteIds: isHydrated ? store.favoriteIds : [],
  };
}
