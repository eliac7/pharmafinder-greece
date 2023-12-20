"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/mapMovementHook";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import { IMapProps, IPharmacyMapProps, IPoint } from "./interfaces";
import PharmacyMarker, { userLocationMarker } from "./pharmacy-marker";

const POI: React.FC<IMapProps> = ({ points, selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, points, selectedPharmacy);
  return null;
};

const MapBoundsAdjuster = ({
  points,
  is_by_city,
}: {
  points: IPoint[];
  is_by_city: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (is_by_city && points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
      map.fitBounds(bounds);
    }
  }, [points, is_by_city, map]);

  return null;
};

export default function PharmacyMap({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  radius,
}: IPharmacyMapProps) {
  const { location } = useLocationContext();
  const pathname = usePathname().split("/")[1];
  const is_by_city = pathname === "by_city";

  const markerRefs = useRef(new Map());

  useEffect(() => {
    if (selectedPharmacy) {
      const markerRef = markerRefs.current.get(selectedPharmacy.address);
      markerRef?.openPopup();
    } else {
      markerRefs.current.forEach((ref) => ref?.closePopup());
    }
  }, [selectedPharmacy, pharmacies]);

  const points: IPoint[] = useMemo(() => {
    if (!Array.isArray(pharmacies)) {
      return [];
    }
    return pharmacies.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  }, [pharmacies]);

  let circleCenter = { lat: 37.957569, lng: 23.657761 }; // Default coordinates

  return (
    <MapContainer
      center={circleCenter}
      zoom={is_by_city ? 14 : 16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-[800px] w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains={["a", "b", "c"]}
      />

      {pharmacies && (
        <MarkerClusterGroup chunkedLoading>
          {pharmacies.map((pharmacy, index) => (
            <PharmacyMarker
              key={index}
              pharmacy={pharmacy}
              isSelected={selectedPharmacy?.address === pharmacy.address}
              onPharmacySelect={setSelectedPharmacy}
              ref={(ref) => {
                markerRefs.current.set(pharmacy.address, ref);
              }}
              closePopup={!selectedPharmacy}
            />
          ))}
        </MarkerClusterGroup>
      )}

      <POI points={points} selectedPharmacy={selectedPharmacy} />

      {location.latitude && location.longitude && (
        <Marker
          position={[location.latitude, location.longitude]}
          icon={userLocationMarker}
        >
          <Popup>
            <span className="flex justify-center p-5">Βρίσκεστε εδώ</span>
          </Popup>
        </Marker>
      )}
      <MapBoundsAdjuster points={points} is_by_city={is_by_city} />

      <FullscreenControl />
    </MapContainer>
  );
}
