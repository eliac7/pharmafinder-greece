"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { NavigationPreference } from "./types";

interface NavigationPreferenceState {
  preferredProvider: NavigationPreference;
  _hasHydrated: boolean;
  setPreferredProvider: (provider: NavigationPreference) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const NAVIGATION_PREFERENCE_STORAGE_KEY =
  "pharmacy-navigation-preference";

export const useNavigationPreferenceStore =
  create<NavigationPreferenceState>()(
    persist(
      (set) => ({
        preferredProvider: "ask",
        _hasHydrated: false,
        setPreferredProvider: (preferredProvider) =>
          set({ preferredProvider }),
        setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
      }),
      {
        name: NAVIGATION_PREFERENCE_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ preferredProvider }) => ({ preferredProvider }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    )
  );

export function useNavigationPreference() {
  const preferredProvider = useNavigationPreferenceStore(
    (state) => state.preferredProvider
  );
  const setPreferredProvider = useNavigationPreferenceStore(
    (state) => state.setPreferredProvider
  );
  const isHydrated = useSyncExternalStore(
    useNavigationPreferenceStore.subscribe,
    () => useNavigationPreferenceStore.getState()._hasHydrated,
    () => false
  );

  return {
    preferredProvider: isHydrated ? preferredProvider : ("ask" as const),
    setPreferredProvider,
    isHydrated,
  };
}
