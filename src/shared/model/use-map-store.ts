import { create } from "zustand";

interface FlyToTarget {
  center: [number, number];
  zoom?: number;
  pharmacyId?: number;
}

interface MapStore {
  flyToTarget: FlyToTarget | null;
  popupTargetId: number | null;
  selectedPharmacyId: number | null;
  flyTo: (center: [number, number], zoom?: number, pharmacyId?: number) => void;
  clearFlyToTarget: () => void;
  setPopupTargetId: (id: number | null) => void;
  setSelectedPharmacyId: (id: number | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  flyToTarget: null,
  popupTargetId: null,
  selectedPharmacyId: null,
  flyTo: (center, zoom, pharmacyId) =>
    set({ 
      flyToTarget: { center, zoom, pharmacyId },
      selectedPharmacyId: pharmacyId ?? null
    }),
  clearFlyToTarget: () => set({ flyToTarget: null }),
  setPopupTargetId: (id) => set({ popupTargetId: id }),
  setSelectedPharmacyId: (id) => set({ selectedPharmacyId: id }),
}));
