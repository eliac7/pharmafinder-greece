"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Circle,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import { IMapProps, IPharmacyMapProps, IPoint } from "./interfaces";
import PharmacyMarker, { userLocationMarker } from "./pharmacy-marker";
import { useQueryState, parseAsString } from "nuqs";

import { CiViewList } from "react-icons/ci";
import { useTheme } from "next-themes";
import clsx from "clsx";

const POI: React.FC<IMapProps> = ({ points, selectedPharmacy }) => {
  const map = useMap();
  useMapMovement(map, points, selectedPharmacy);
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

const ToggleListButton = ({
  toggleListVisibility,
}: {
  toggleListVisibility: () => void;
}) => {
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
      className="absolute right-0 top-20 z-[1000] m-4 hidden rounded-full bg-complementary-400 p-2 shadow-md transition-all duration-300 hover:bg-complementary-500 md:block"
      onClick={handleClick}
      aria-label="Εμφάνιση/Απόκρυψη λίστας φαρμακείων"
      title="Εμφάνιση/Απόκρυψη λίστας φαρμακείων"
    >
      <CiViewList size={24} color="white" />
    </button>
  );
};

const RadiusRangeSlider = ({
  radius,
  circleRef,
  setRadiusQuery,
  is_by_city,
}: {
  radius: string | undefined;
  circleRef: React.MutableRefObject<L.Circle | null>;
  setRadiusQuery: (radius: string) => void;
  is_by_city: boolean;
}) => {
  const map = useMap();
  const [value, setValue] = useState(radius || "1");

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (map) {
      map.dragging.disable();
    }
    setValue(e.target.value);
  };

  const handleSliderInteractionEnd = (
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    if (map) {
      map.dragging.enable();
    }
    setRadiusQuery(value);
    circleRef.current?.setRadius(parseFloat(value) * 1000);
  };

  return (
    <div
      className={clsx(
        "sm:top-0 absolute left-[50%] z-[500] block translate-x-[-50%] transform rounded-b-xl rounded-t-none bg-slate-600 bg-opacity-50 px-5 py-2 backdrop-blur-sm backdrop-filter dark:bg-primary-600 dark:bg-opacity-50 md:bottom-0 md:rounded-b-none md:rounded-t-xl",
        is_by_city && "hidden"
      )}
      onMouseDown={() => map?.dragging.disable()}
      onMouseUp={handleSliderInteractionEnd}
    >
      <label
        htmlFor="steps-range"
        className="mb-2 block text-sm font-semibold text-white"
      >
        Ακτίνα αναζήτησης: {value} χλμ
      </label>
      <input
        id="steps-range"
        type="range"
        min="1"
        max="10"
        value={value}
        step="1"
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 outline-none dark:bg-gray-700"
        onChange={handleSliderChange}
        onMouseUp={handleSliderInteractionEnd}
      />
    </div>
  );
};

export default function PharmacyMap({
  pharmacies,
  selectedPharmacy,
  setSelectedPharmacy,
  toggleListVisibility,
  radius,
  setRadiusQuery,
}: IPharmacyMapProps) {
  const { location, updateLocation } = useLocationContext();
  const { theme } = useTheme();

  const defaultLayer = theme === "dark" ? "dark" : "road";

  const [layerName, setLayerName] = useQueryState(
    "layer",
    parseAsString.withDefault(defaultLayer)
  );

  const pathname = usePathname().split("/")[1];
  const is_by_city = pathname === "city";

  const markerRefs = useRef(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({
        color: layerName === "dark" ? "#6c8e8c" : "#d9534f",
      });
    }
  }, [layerName]);

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

  const setMap = (map: L.Map) => {
    mapRef.current = map;
  };

  const getTileLayerUrl = () => {
    switch (layerName) {
      case "road":
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case "satellite":
        return "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";
      case "dark":
        return "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";
      default:
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }
  };
  return (
    <MapContainer
      center={circleCenter}
      zoom={is_by_city ? 14 : 16}
      scrollWheelZoom={true}
      attributionControl={false}
      className="h-full w-full"
      ref={setMap}
      maxZoom={18}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer
          name="Οδικός Χάρτης"
          checked={layerName === "road"}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
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
          <TileLayer
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
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
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            subdomains={["a", "b", "c"]}
            eventHandlers={{
              add: () => {
                setLayerName("dark");
              },
            }}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <TileLayer url={getTileLayerUrl()} subdomains={["a", "b", "c"]} />

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

      {radius && location.latitude && location.longitude && (
        <Circle
          center={[location.latitude, location.longitude]}
          radius={parseFloat(radius) * 1000}
          fillOpacity={0}
          weight={2}
          ref={circleRef}
          color={layerName === "dark" ? "#6c8e8c" : "#3a515d "}
          dashArray="10,10"
        />
      )}

      <MapBoundsAdjuster points={points} />

      <FullscreenControl />
      <ToggleListButton toggleListVisibility={toggleListVisibility} />
      <RadiusRangeSlider
        radius={radius}
        circleRef={circleRef}
        setRadiusQuery={setRadiusQuery}
        is_by_city={is_by_city}
      />
    </MapContainer>
  );
}
