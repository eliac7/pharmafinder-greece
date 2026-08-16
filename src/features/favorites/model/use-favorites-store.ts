"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useSyncExternalStore } from "react";

interface FavoritesState {
  /** Numbers can exist only as persisted Phase-0 aliases until resolved once. */
  favoriteIds: Array<string | number>;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  migrateLegacyFavorite: (legacyId: number | string, publicId: string) => void;
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
      migrateLegacyFavorite: (legacyId, publicId) =>
        set((state) => ({
          favoriteIds: Array.from(
            new Set(
              state.favoriteIds.map((id) => (id === legacyId ? publicId : id))
            )
          ),
        })),
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
  const isHydrated = useSyncExternalStore(
    useFavoritesStore.subscribe,
    () => useFavoritesStore.getState()._hasHydrated,
    () => false
  );

  return {
    ...store,
    isHydrated,
    favoriteIds: isHydrated ? store.favoriteIds : [],
  };
}
