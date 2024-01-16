import { useEffect } from "react";
import L from "leaflet";
import { IPoint, ISelectedPharmacy } from "@/components/maps/types";

export const useMapMovement = (
  map: L.Map,
  points: IPoint[],
  selectedPharmacy: ISelectedPharmacy | null
) => {
  useEffect(() => {
    if (!map || !selectedPharmacy) return;

    if (selectedPharmacy) {
      const selectedLatLng = L.latLng(
        selectedPharmacy.latitude,
        selectedPharmacy.longitude
      );
      map.setView(selectedLatLng, 18);
    }
  }, [map, selectedPharmacy]);
};
