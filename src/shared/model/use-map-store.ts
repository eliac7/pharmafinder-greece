import { create } from "zustand";
import type { ActionPublicDetail } from "@/entities/pharmacy";

interface FlyToTarget {
  center: [number, number];
  zoom?: number;
  pharmacyId?: string;
}

interface ProductPopupTarget {
  detail: ActionPublicDetail;
  center: [number, number];
  timeFilter?: "now" | "today" | "tomorrow";
}

interface MapStore {
  flyToTarget: FlyToTarget | null;
  popupTargetId: string | null;
  selectedPharmacyId: string | null;
  productPopupTarget: ProductPopupTarget | null;
  flyTo: (center: [number, number], zoom?: number, pharmacyId?: string) => void;
  clearFlyToTarget: () => void;
  setPopupTargetId: (id: string | null) => void;
  setSelectedPharmacyId: (id: string | null) => void;
  setProductPopupTarget: (target: ProductPopupTarget | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  flyToTarget: null,
  popupTargetId: null,
  selectedPharmacyId: null,
  productPopupTarget: null,
  flyTo: (center, zoom, pharmacyId) =>
    set({ 
      flyToTarget: { center, zoom, pharmacyId },
      selectedPharmacyId: pharmacyId ?? null
    }),
  clearFlyToTarget: () => set({ flyToTarget: null }),
  setPopupTargetId: (id) => set({ popupTargetId: id }),
  setSelectedPharmacyId: (id) => set({ selectedPharmacyId: id }),
  setProductPopupTarget: (target) => set({ productPopupTarget: target }),
}));
