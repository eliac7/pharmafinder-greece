"use client";
import { useLocationContext } from "@/context/LocationContext";
import { useMapMovement } from "@/hooks/useMapMovement";
import * as L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet/dist/leaflet.css";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef } from "react";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import PharmacyMarker, { userLocationMarker } from "./PharmacyMarker";
import { IMapProps, IPharmacyMapProps, IPoint } from "./types";

import { useFilters } from "@/context/FiltersContext";
import { useTheme } from "next-themes";
import TileLayerComponent from "./CustomTileLayer";
import RelocateUserButton from "./buttons/RelocateUserButton";
import ToggleFilterButton from "./buttons/ToggleFilterButton";
import ToggleListButton from "./buttons/ToggleListButton";

const POI: React.FC<IMapProps> = ({ selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, selectedPharmacy);
  return null;
};

const MapBoundsAdjuster = ({ points }: { points: IPoint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0 && points.every((p) => p.lat && p.lng)) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
};

export default function PharmacyMap({
  pharmacies,
  isHoveringHideButton,
  setIsHoveringHideButton,
}: IPharmacyMapProps) {
  const {
    radiusQuery: radius,
    searchType,
    selectedPharmacy,
    setSelectedPharmacy,
    isListVisible,
    setIsListVisible,
  } = useFilters();

  const { location, updateLocation, getLocation } = useLocationContext();
  const { resolvedTheme } = useTheme();

  const [layerName, setLayerName] = useQueryState<string>(
    "layer",
    parseAsString.withDefault(resolvedTheme === "dark" ? "dark" : "road"),
  );

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({
        color: layerName === "dark" ? "#6c8e8c" : "#d9534f ",
      });
    }
  }, [resolvedTheme, layerName]);

  const markerRefs = useRef(new Map());
  const circleRef = useRef<L.Circle | null>(null);

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
  if (location.latitude && location.longitude) {
    circleCenter = { lat: location.latitude, lng: location.longitude };
  }

  return (
    <MapContainer
      center={circleCenter}
      zoom={16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-full w-full"
      maxZoom={18}
    >
      <LayersControl position="bottomright">
        <LayersControl.BaseLayer
          name="Οδικός Χάρτης"
          checked={layerName === "road"}
        >
          <TileLayerComponent
            layerName={layerName}
            eventHandlers={{
              add: () => {
                setLayerName("road");
              },
            }}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          name="Αεροφωτογραφίες"
          checked={layerName === "satellite"}
        >
          <TileLayerComponent
            layerName={layerName}
            eventHandlers={{
              add: () => {
                setLayerName("satellite");
              },
            }}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer
          name="Σκοτεινός Χάρτης"
          checked={layerName === "dark"}
        >
          <TileLayerComponent
            layerName={layerName}
            eventHandlers={{
              add: () => {
                setLayerName("dark");
              },
            }}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <TileLayerComponent layerName={layerName} />

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
        <>
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
              <span className="flex justify-center rounded-lg bg-white p-3 text-center">
                Βρίσκεστε εδώ, αν θέλετε να αλλάξετε την τοποθεσία σας σύρετε το
                εικονίδιο.
              </span>
            </Popup>
          </Marker>

          <RelocateUserButton getLocation={getLocation} location={location} />
        </>
      )}

      {searchType === "nearby" &&
        radius &&
        location.latitude &&
        location.longitude && (
          <Circle
            center={[location.latitude, location.longitude]}
            radius={radius * 1000}
            fillOpacity={0}
            weight={2}
            ref={circleRef}
            color={layerName === "dark" ? "#6c8e8c" : "#3a515d "}
            dashArray="10,10"
          />
        )}

      <MapBoundsAdjuster points={points} />

      <FullscreenControl
        title="Εμφάνιση σε πλήρη οθόνη"
        titleCancel="Έξοδος από πλήρη οθόνη"
        position="topright"
      />

      <ToggleListButton
        toggleListVisibility={setIsListVisible}
        isListVisible={isListVisible}
        isHoveringHideButton={isHoveringHideButton}
        setIsHoveringHideButton={setIsHoveringHideButton}
      />

      <ToggleFilterButton />
    </MapContainer>
  );
}
