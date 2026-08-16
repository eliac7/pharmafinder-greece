import { create } from "zustand";

interface FlyToTarget {
  center: [number, number];
  zoom?: number;
  pharmacyId?: string;
}

interface MapStore {
  flyToTarget: FlyToTarget | null;
  popupTargetId: string | null;
  selectedPharmacyId: string | null;
  flyTo: (center: [number, number], zoom?: number, pharmacyId?: string) => void;
  clearFlyToTarget: () => void;
  setPopupTargetId: (id: string | null) => void;
  setSelectedPharmacyId: (id: string | null) => void;
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
