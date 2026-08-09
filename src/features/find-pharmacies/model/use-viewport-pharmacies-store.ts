import { create } from "zustand";

import type { Pharmacy } from "@/entities/pharmacy";

interface ViewportPharmaciesState {
  pharmacies: Pharmacy[] | null;
  isFetching: boolean;
  setPharmacies: (pharmacies: Pharmacy[]) => void;
  setIsFetching: (isFetching: boolean) => void;
  reset: () => void;
}

export const useViewportPharmaciesStore = create<ViewportPharmaciesState>(
  (set) => ({
    pharmacies: null,
    isFetching: false,
    setPharmacies: (pharmacies) => set({ pharmacies }),
    setIsFetching: (isFetching) => set({ isFetching }),
    reset: () => set({ pharmacies: null, isFetching: false }),
  })
);
