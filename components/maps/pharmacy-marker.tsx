import { Marker, Popup } from "react-leaflet";
import { IPharmacy } from "@/lib/interfaces";
import * as L from "leaflet";
import PharmacyPopUpProps from "./pharmacy-popup";
import { forwardRef } from "react";

interface PharmacyMarkerProps {
  pharmacy: IPharmacy;
  isSelected: boolean;
  onPharmacySelect: (pharmacy: IPharmacy) => void;
  closePopup: boolean;
}

export const customMarker = L.icon({
  iconUrl: "/pharmacy.png",
  iconSize: [60, 60],
  iconAnchor: [16, 32],
  popupAnchor: [10, -25],
  shadowSize: [41, 41],
  className: "bg-slate-200 rounded-full",
});

export const glowingCustomMarker = L.icon({
  iconUrl: "/pharmacy.png",
  iconSize: [60, 60],
  iconAnchor: [16, 32],
  popupAnchor: [10, -25],
  shadowSize: [41, 41],
  className: "marker-glow",
});

export const userLocationMarker = L.icon({
  iconUrl: "/me_myself_and_i.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PharmacyMarker = forwardRef<L.Marker, PharmacyMarkerProps>(
  ({ pharmacy, isSelected, onPharmacySelect }: PharmacyMarkerProps, ref) => {
    const markerIcon = isSelected ? glowingCustomMarker : customMarker;

    return (
      <Marker
        position={[pharmacy.latitude, pharmacy.longitude]}
        icon={markerIcon}
        ref={ref}
        eventHandlers={{
          click: () => onPharmacySelect(pharmacy),
        }}
      >
        <Popup>
          <PharmacyPopUpProps {...pharmacy} />
        </Popup>
      </Marker>
    );
  }
);

PharmacyMarker.displayName = "PharmacyMarker";

export default PharmacyMarker;
