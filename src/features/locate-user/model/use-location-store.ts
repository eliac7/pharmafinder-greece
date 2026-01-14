"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  setLocation: (lat: number, lng: number) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
      clearLocation: () => set({ latitude: null, longitude: null }),
    }),
    {
      name: "user-location",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
