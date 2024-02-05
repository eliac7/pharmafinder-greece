import { useEffect } from "react";
import L from "leaflet";
import { ISelectedPharmacy } from "@/components/maps/types";

export const useMapMovement = (
  map: L.Map,
  selectedPharmacy: ISelectedPharmacy | null,
) => {
  useEffect(() => {
    if (!map || !selectedPharmacy) return;

    if (selectedPharmacy) {
      const selectedLatLng = L.latLng(
        selectedPharmacy.latitude,
        selectedPharmacy.longitude,
      );
      map.setView(selectedLatLng, 16);
    }
  }, [map, selectedPharmacy]);
};
