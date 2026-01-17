import { create } from "zustand";

interface FlyToTarget {
  center: [number, number];
  zoom?: number;
}

interface MapStore {
  flyToTarget: FlyToTarget | null;
  flyTo: (center: [number, number], zoom?: number) => void;
  clearFlyToTarget: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  flyToTarget: null,
  flyTo: (center, zoom) => set({ flyToTarget: { center, zoom } }),
  clearFlyToTarget: () => set({ flyToTarget: null }),
}));
