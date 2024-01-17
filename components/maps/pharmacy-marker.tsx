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
  className: "rounded-full",
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
  iconUrl: "/location.png",
  iconSize: [45, 45],
  iconAnchor: [12, 41],
  popupAnchor: [3, -40],
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
        <Popup maxWidth={390} className="overflow-hidden rounded-lg">
          <PharmacyPopUpProps {...pharmacy} />
        </Popup>
      </Marker>
    );
  },
);

PharmacyMarker.displayName = "PharmacyMarker";

export default PharmacyMarker;
