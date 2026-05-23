"use client";

import { create } from "zustand";
import { pharmacyApi, type Pharmacy } from "@/entities/pharmacy";
import { type TimeFilter } from "./types";

interface CityPharmaciesState {
  citySlug: string | null;
  timeFilter: TimeFilter;

  pharmacies: Pharmacy[];
  isRefetching: boolean;
  userLocation: { lat: number; lng: number } | null;

  initialize: (
    citySlug: string,
    timeFilter: TimeFilter,
    pharmacies: Pharmacy[],
    userLocation?: { lat: number; lng: number } | null
  ) => void;
  setPharmacies: (pharmacies: Pharmacy[]) => void;
  refetchWithLocation: (lat: number, lng: number) => Promise<void>;
}

export const useCityPharmaciesStore = create<CityPharmaciesState>(
  (set, get) => ({
    citySlug: null,
    timeFilter: "now",
    pharmacies: [],
    isRefetching: false,
    userLocation: null,

    initialize: (citySlug, timeFilter, pharmacies, userLocation) =>
      set({
        citySlug,
        timeFilter,
        pharmacies,
        ...(userLocation !== undefined ? { userLocation } : {}),
      }),

    setPharmacies: (pharmacies) => set({ pharmacies }),

    refetchWithLocation: async (lat, lng) => {
      const { citySlug, timeFilter } = get();
      if (!citySlug) return;

      set({ isRefetching: true, userLocation: { lat, lng } });
      try {
        const data = await pharmacyApi.getCityPharmacies(
          citySlug,
          timeFilter,
          lat,
          lng
        );
        // Sort by distance when we have location data
        const sorted = data.toSorted((a, b) => {
          if (a.distance_km == null) return 1;
          if (b.distance_km == null) return -1;
          return a.distance_km - b.distance_km;
        });
        set({ pharmacies: sorted, isRefetching: false });
      } catch (error) {
        console.error("Failed to refetch pharmacies with location:", error);
        set({ isRefetching: false });
      }
    },
  })
);
