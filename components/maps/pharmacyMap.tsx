"use client";
import { useEffect, useMemo, useRef } from "react";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/mapMovementHook";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";
import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import { IMapProps, IPharmacyMapProps, IPoint } from "./interfaces";
import PharmacyMarker, { userLocationMarker } from "./pharmacy-marker";

import { CiViewList } from "react-icons/ci";

const POI: React.FC<IMapProps> = ({ points, selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, points, selectedPharmacy);
  return null;
};

const MapBoundsAdjuster = ({ points }: { points: IPoint[] }) => {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, map]);

  return null;
};

function ToggleListButton({
  toggleListVisibility,
}: {
  toggleListVisibility: () => void;
}) {
  const map = useMap();

  const handleClick = () => {
    toggleListVisibility();
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  };

  return (
    <button
      className="absolute right-0 top-20 z-[1000] m-4 rounded-full bg-complementary-400 p-2 shadow-md transition-all duration-300 hover:bg-complementary-500"
      onClick={handleClick}
      aria-label="Εμφάνιση λίστας φαρμακείων"
    >
      <CiViewList size={24} color="white" />
    </button>
  );
}

export default function PharmacyMap({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  toggleListVisibility,
}: IPharmacyMapProps) {
  const { location, updateLocation } = useLocationContext();
  const pathname = usePathname().split("/")[1];
  const is_by_city = pathname === "city";

  const markerRefs = useRef(new Map());

  useEffect(() => {
    if (selectedPharmacy) {
      const markerRef = markerRefs.current.get(selectedPharmacy.name);
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

  let circleCenter = { lat: 37.97562008259405, lng: 23.734130859375 };

  const mapRef = useRef<L.Map | null>(null);
  const setMap = (map: L.Map) => {
    mapRef.current = map;
  };

  return (
    <MapContainer
      center={circleCenter}
      zoom={is_by_city ? 14 : 16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-full w-full"
      ref={setMap}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Οδικός Χάρτης">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Αεροφωτογραφίες">
          <TileLayer
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Σκοτεινός Χάρτης">
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c"]}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

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
              isSelected={selectedPharmacy?.name === pharmacy.name}
              onPharmacySelect={setSelectedPharmacy}
              ref={(ref) => {
                markerRefs.current.set(pharmacy.name, ref);
              }}
              closePopup={!selectedPharmacy}
            />
          ))}
        </MarkerClusterGroup>
      )}

      <POI points={points} selectedPharmacy={selectedPharmacy} />

      {location.latitude && location.longitude && (
        <Marker
          draggable={true}
          icon={userLocationMarker}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              updateLocation(position);
            },
          }}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <span className="flex justify-center p-5">
              Βρίσκεστε εδώ, αν θέλετε να αλλάξετε την τοποθεσία σας σύρετε το
              εικονίδιο.
            </span>
          </Popup>
        </Marker>
      )}

      <MapBoundsAdjuster points={points} />

      <FullscreenControl />
      <ToggleListButton toggleListVisibility={toggleListVisibility} />
    </MapContainer>
  );
}
