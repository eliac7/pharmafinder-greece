"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isAdjusting: boolean;
  setLocation: (lat: number, lng: number) => void;
  setIsAdjusting: (isAdjusting: boolean) => void;
  clearLocation: () => void;
}

// Helper to sync location to a cookie for SSR access
function syncToCookie(lat: number | null, lng: number | null) {
  if (typeof document === "undefined") return;

  if (lat && lng) {
    // Set cookie with 30 day expiry
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `user-location=${JSON.stringify({
      latitude: lat,
      longitude: lng,
    })};expires=${expires.toUTCString()};path=/`;
  } else {
    // Clear cookie
    document.cookie =
      "user-location=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      isAdjusting: false,
      setLocation: (lat, lng) => {
        syncToCookie(lat, lng);
        set({ latitude: lat, longitude: lng });
      },
      setIsAdjusting: (isAdjusting) => set({ isAdjusting }),
      clearLocation: () => {
        syncToCookie(null, null);
        set({ latitude: null, longitude: null });
      },
    }),
    {
      name: "user-location",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
